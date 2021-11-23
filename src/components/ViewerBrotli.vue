<template>
  <JsonEditor ref='editor' :content='newContent'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const decompress = require('brotli/decompress');

export default {
  components: {JsonEditor},
  props: ['content'],
  computed: {
    newContent() {
      let decompressed = this.brotliStr;

      if (typeof decompressed === 'string') {
        if (this.$util.isJson(decompressed)) {
          return JSON.parse(decompressed);
        }

        return decompressed;
      }

      return 'Brotli Parse Failed!';
    },
    brotliStr() {
      return this.$util.brotliToString(this.content);
    },
  },
  methods: {
    copyContent() {
      return this.brotliStr;
    }
  },
}
</script>
