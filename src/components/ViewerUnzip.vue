<template>
  <JsonEditor ref='editor' :content='newContent'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const zlib = require('zlib');

export default {
  components: {JsonEditor},
  props: ['content'],
  computed: {
    newContent() {
      let formatStr = this.formatStr;

      if (typeof formatStr === 'string') {
        if (this.$util.isJson(formatStr)) {
          return JSON.parse(formatStr);
        }

        return formatStr;
      }

      return 'Zlib Unzip Parse Failed';
    },
    formatStr() {
      try {
        // unzip will automatically detect Gzip or Deflate header
        return zlib.unzipSync(this.content).toString()
      }
      catch (e) {}

      return false;
    },
  },
  methods: {
    copyContent() {
      return this.formatStr;
    }
  },
}
</script>
