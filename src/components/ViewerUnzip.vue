<template>
  <JsonEditor ref='editor' :content='newContent'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';

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

      return 'Zlib Unzip Parse Failed!';
    },
    formatStr() {
      return this.$util.zippedToString(this.content, 'zip');
    },
  },
  methods: {
    copyContent() {
      return this.formatStr;
    }
  },
}
</script>
