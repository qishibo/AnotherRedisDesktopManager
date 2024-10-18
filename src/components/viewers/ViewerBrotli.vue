<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='false'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const JSONbig = require('@qii404/json-bigint')({ useNativeBigInt: false });

const zlib = require('zlib');

export default {
  components: { JsonEditor },
  props: ['content'],
  computed: {
    newContent() {
      const { formatStr } = this;

      if (typeof formatStr === 'string') {
        if (this.$util.isJson(formatStr)) {
          return JSONbig.parse(formatStr);
        }

        return formatStr;
      }

      return 'Zlib Brotli Parse Failed!';
    },
    formatStr() {
      return this.$util.zippedToString(this.content, 'brotli');
    },
  },
  methods: {
    getContent() {
      const content = this.$refs.editor.getRawContent(true);
      return zlib.brotliCompressSync(content);
    },
    copyContent() {
      return this.formatStr;
    },
  },
};
</script>
