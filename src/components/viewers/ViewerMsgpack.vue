<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='false'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import {decode, encode} from "algo-msgpack-with-bigint"
const JSONbig = require('@qii404/json-bigint')({useNativeBigInt: true});


export default {
  props: ['content'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        return decode(this.content);
      } catch (e) {
        return this.$t('message.msgpack_format_failed');
      }
    },
  },
  methods: {
    getContent() {
      let content = this.$refs.editor.getRawContent();

      // raw content is an object
      if (typeof this.newContent !== 'string') {
        try {
          content = JSONbig.parse(content); 
        }
        catch (e) {
          // object parse failed
          this.$message.error({
            message: 'Raw content is an object, but now parse object failed: ' + e.message,
            duration: 6000,
          });

          return false
        }
      }

      // encode returns Uint8Array
      return Buffer.from(encode(content));
    },
    copyContent() {
      const content = decode(this.content);
      return (typeof content === 'object') ? JSONbig.stringify(content) : content;
    }
  }
}
</script>
