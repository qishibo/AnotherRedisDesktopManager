<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='false' class='protobuf-viewer'>
    <div class="viewer-protobuf-header">
      <!-- type selector -->
      <el-select v-model="selectedType" filterable placeholder="Select Type" size="mini" class="type-selector">
        <el-option
          v-for="t of types"
          :key="t"
          :label="t"
          :value="t">
        </el-option>
      </el-select>
      <!-- select proto file -->
      <el-button
        class="select-proto-btn"
        type='primary'
        size="mini"
        icon="el-icon-upload2"
        :title="buttonTitle"
        @click="selectProto">
        <span class="select-proto-text">{{ buttonText }}</span>
        <!-- clear proto files -->
        <i
          v-if="proto.length"
          class="el-icon-close"
          title="Clear Proto"
          @click.stop="clearProto">
        </i>
      </el-button>
    </div>
    <hr>
  </JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import storage from '@/storage';
import { getData } from 'rawproto';

const protobuf = require('protobufjs/minimal');
const fs = require('fs');
const path = require('path');
const { dialog, app } = require('electron').remote;

const DECODE_FAILED = 'Protobuf Decode Failed!';

export default {
  data() {
    return {
      proto: [],
      bookmarks: [],
      protoRoot: null,
      types: ['Rawproto'],
      selectedType: 'Rawproto',
    };
  },
  components: { JsonEditor },
  props: ['content', 'redisKey'],
  computed: {
    newContent() {
      try {
        if (this.selectedType === 'Rawproto') {
          return getData(this.content);
        }
        const type = this.protoRoot.lookupType(this.selectedType);
        const message = type.decode(this.content);
        // notice: toJSON will convert int64 to string
        // can use toObject instead: type.toObject(message, {longs: BigInt})
        return message.toJSON();
      } catch (e) {
        return DECODE_FAILED;
      }
    },
    buttonTitle() {
      return this.proto.length ? this.proto.join('\n') : 'Select Proto Files';
    },
    buttonText() {
      if (!this.proto.length) {
        return 'Select Proto Files';
      }

      return this.proto.map(p => path.basename(p || '')).join(', ');
    },
    keyHex() {
      return this.redisKey.toString('hex');
    },
  },
  mounted() {
    this.restoreBinding();
  },
  methods: {
    getContent() {
      if (!this.protoRoot) {
        this.$message.error('Select a correct .proto file');
        return false;
      }

      if (!this.selectedType || this.selectedType === 'Rawproto') {
        this.$message.error('Select a correct Type to encode');
        return false;
      }

      let content = this.$refs.editor.getRawContent();
      const type = this.protoRoot.lookupType(this.selectedType);

      try {
        content = JSON.parse(content);
      } catch (e) {
        this.$message.error(this.$t('message.json_format_failed'));
        return false;
      }

      // toJSON() shows int64/uint64 as strings; fromObject converts them back
      const message = type.fromObject(content);
      const err = type.verify(message);
      if (err) {
        this.$message.error(`Proto Verify Failed: ${err}`);
        return false;
      }

      return type.encode(message).finish();
    },
    copyContent() {
      return JSON.stringify(this.newContent);
    },
    selectProto() {
      dialog.showOpenDialog({
        securityScopedBookmarks: true,
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: '.proto',
            extensions: ['proto'],
          },
        ],
      }).then((result) => {
        if (result.canceled) return;

        this.loadProtoFiles(result.filePaths || [], result.bookmarks || [], true);
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    restoreBinding() {
      const profile = storage.getProtobufProfileByRedisKey(this.keyHex);
      if (!profile || !profile.paths) {
        return;
      }

      this.loadProtoFiles(profile.paths, profile.bookmarks || [], false);
    },
    loadProtoFiles(paths, bookmarks = [], persist = false) {
      if (!paths.length) {
        return Promise.resolve(false);
      }

      // file not found
      const missing = paths.filter(p => !fs.existsSync(p));
      if (missing.length) {
        this.$message.error(
          "Proto file not found, please reselect: " +
          `${missing.map(p => path.basename(p)).join(', ')}`
        );
        this.clearBinding();
        return Promise.resolve(false);
      }
      // apply bookmark
      const release = this.accessBookmarks(bookmarks);
      // then read
      return protobuf.load(paths).then((root) => {
        this.proto = paths;
        this.bookmarks = bookmarks || [];

        this.protoRoot = root;
        this.types = ['Rawproto'];
        this.traverseTypes(root);
        // default select the first real type
        this.selectedType = this.types.length > 1 ? this.types[1] : 'Rawproto';

        // protobuf decode failed
        if (this.selectedType === 'Rawproto' || this.newContent === DECODE_FAILED) {
          // restore mode, clear binding
          // if (!persist) {
          //   this.clearBinding();
          // }
          return false;
        }

        // protobuf decode success
        if (persist) {
          this.persistBinding();
        }

        return true;
      }).catch((e) => {
        this.$message.error(`Fail to load proto: ${e.message}`);
        this.clearBinding();
        return false;
      }).finally(() => {
        // release bookmarks if exists
        release();
      });
    },
    persistBinding() {
      const redisKeyHex = this.keyHex;
      if (!redisKeyHex || !this.proto.length) {
        return;
      }

      storage.bindProtobufProfile(redisKeyHex, {
        name: this.proto.map(p => path.basename(p)).join(', '),
        paths: this.proto,
        bookmarks: this.bookmarks,
      });
    },
    clearBinding() {
      storage.unbindProtobufProfile(this.keyHex);
    },
    clearProto() {
      this.clearBinding();
      this.proto = [];
      this.bookmarks = [];
      this.protoRoot = null;
      this.types = ['Rawproto'];
      this.selectedType = 'Rawproto';
    },
    accessBookmarks(bookmarks = []) {
      const closers = [];

      (bookmarks || []).forEach((bookmark) => {
        if (!bookmark) {
          return;
        }

        try {
          const close = app.startAccessingSecurityScopedResource(bookmark);
          (typeof close === 'function') && closers.push(close);
        } catch (e) {
          this.$message.error(e.message);
        }
      });

      return () => {
        closers.forEach(close => close());
      };
    },
    traverseTypes(current) {
      if (current instanceof protobuf.Type) {
        this.types.push(current.fullName);
      }
      if (current.nestedArray) {
        current.nestedArray.forEach((nested) => {
          this.traverseTypes(nested);
        });
      }
    },
  },
};
</script>

<style type="text/css">
  .viewer-protobuf-header {
    display: flex;
    margin-top: 8px;
  }
  .viewer-protobuf-header .type-selector {
    flex: 1;
    margin-right: 10px;
  }
  .viewer-protobuf-header .select-proto-btn {
    margin-top: 2px;
    height: 27px;
    max-width: 240px;
    padding-right: 8px;
  }
  .viewer-protobuf-header .select-proto-btn .select-proto-text {
    display: inline-block;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  /*text viewer box*/
  .key-content-string .text-formated-container.protobuf-viewer .monaco-editor-con {
    height: calc(100vh - 331px);
  }
</style>
