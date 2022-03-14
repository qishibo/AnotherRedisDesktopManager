<template>
  <div>
    <el-button type='text' icon="el-icon-menu" @click="selectProto">Select Proto</el-button>
    <el-tag v-for="p of proto">{{ p }}</el-tag>
    <br>
    <el-select v-model="selectedType" class="type-selector">
      <el-option
          v-for="t of types"
          :key="t"
          :label="t"
          :value="t">
      </el-option>
    </el-select>
    <JsonEditor ref='editor' :content='newContent' :readOnly='true'></JsonEditor>
  </div>
</template>
<style>
.type-selector {
  width: 100%;
}
</style>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import { getData } from 'rawproto';
import * as protobuf from 'protobufjs';

const { dialog } = require('electron').remote;

export default {
  data() {
    return {
      proto: [],
      protoRoot: new protobuf.Root(),
      types: ['rawproto'],
      selectedType: 'rawproto',
    };
  },
  components: { JsonEditor },
  props: ['content'],
  computed: {
    newContent() {
      try {
        if (this.selectedType === 'rawproto') {
          return getData(this.content);
        }
        const t = this.protoRoot.lookupType(this.selectedType);
        const m = t.decode(this.content);
        return m.toJSON();
      } catch (e) {
        return this.$t('message.protobuf_decode_failed');
      }
    },
  },
  methods: {
    traverseTypes(current, fn) {
      if (current instanceof protobuf.Type) {
        fn(current);
      }
      if (current.nestedArray) {
        current.nestedArray.forEach((nested) => {
          this.traverseTypes(nested, fn);
        });
      }
    },
    selectProto() {
      dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: 'Protobuf',
            extensions: ['proto'],
          },
        ],
      })
        .then((result) => {
          if (result.canceled) return;
          this.proto = result.filePaths;
          this.types = ['rawproto'];
          this.selectedType = 'rawproto';
          return protobuf.load(this.proto);
        })
        .then((root) => {
          if (!root) return;
          this.protoRoot = root;
          this.traverseTypes(root, (type) => {
            this.types.push(type.fullName);
          });
        });
    },
  },
};
</script>
