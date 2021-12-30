<template>
  <div class="format-viewer-container">
    <span @click='unserializeContent' :title='$t("message.unserialize")' class='el-icon-document formater-copy-icon'>{{$t("message.unserialize")}}</span>
    <JsonEditor ref='editor' :content='newContent' :readOnly='disabled||false'></JsonEditor>
  </div>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const JSONbig = require('json-bigint')({useNativeBigInt: false});
const zlib = require('zlib');
import {unserialize} from 'php-serialize';

export default {
  props: ['content', 'disabled'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        return zlib.inflateSync(this.content).toString("utf8");
      } catch (e) {
        // parse failed, return raw content to edit instead of error
        return this.content.toString();
      }
    },
  },
  methods: {
    getContent() {
      return this.$refs.editor.content;
    },
    unserializeContent() {
      this.$refs.editor.content = unserialize(this.getContent());
    },
  },
}
</script>
