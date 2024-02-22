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
      <el-button class="select-proto-btn" type='primary' size="mini" icon="el-icon-upload2" @click="selectProto">Select Proto Files</el-button>
    </div>
    <!-- selected files -->
    <!-- <el-tag v-for="p of proto" :key="p" class="selected-proto-file-tag">{{ p }}</el-tag> -->
    <hr>
  </JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import { getData } from 'rawproto';
// import * as protobuf from 'protobufjs';
const protobuf = require("protobufjs/minimal");
const { dialog } = require('electron').remote;

export default {
  data() {
    return {
      proto: [],
      protoRoot: null,
      types: ['Rawproto'],
      selectedType: 'Rawproto',
    };
  },
  components: { JsonEditor },
  props: ['content'],
  computed: {
    newContent() {
      try {
        if (this.selectedType === 'Rawproto') {
          return getData(this.content);
        }
        const type = this.protoRoot.lookupType(this.selectedType);
        const message = type.decode(this.content);
        return message.toJSON();
      } catch (e) {
        return 'Protobuf Decode Failed!';
      }
    },
  },
  methods: {
    traverseTypes(current) {
      if (current instanceof protobuf.Type) {
        this.types.push(current.fullName);
      }
      if (current.nestedArray) {
        current.nestedArray.forEach(nested => {
          this.traverseTypes(nested);
        });
      }
    },
    selectProto() {
      dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: '.proto',
            extensions: ['proto'],
          },
        ],
      }).then(result => {
          if (result.canceled) return;
          this.proto = result.filePaths;
          this.types = ['Rawproto'];
          this.selectedType = 'Rawproto';

          protobuf.load(this.proto).then(root => {
            this.protoRoot = root;
            // init types
            this.traverseTypes(root);
            // first type as default
            if (this.types.length > 0) {
              this.selectedType = this.types[1];
            }
          }).catch(e => {
            this.$message.error(e.message);
          });
        }).catch(e => {
          this.$message.error(e.message);
        });
    },
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
        const err = type.verify(content);

        if (err) {
          this.$message.error('Proto Verify Failed: ' + err);
          return false;
        }

        const message = type.create(content);
        return type.encode(message).finish();
      }
      catch(e) {
        this.$message.error(this.$t('message.json_format_failed'));
        return false;
      }
    },
    copyContent() {
      return JSON.stringify(this.newContent);
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
  }
  .selected-proto-file-tag {
    margin-right: 4px;
  }

  /*text viewer box*/
  .key-content-string .text-formated-container.protobuf-viewer .monaco-editor-con {
    height: calc(100vh - 385px);
  }
</style>
