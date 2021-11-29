<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='disabled||false'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const JSONbig = require('json-bigint')({useNativeBigInt: false});

export default {
  props: ['content', 'disabled'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        return JSONbig.parse(this.content);
      } catch (e) {
        // parse failed, return raw content to edit instead of error
        return this.content.toString();
      }
    },
  },
  methods: {
    getContent() {
      return this.$refs.editor.getContent();
    },
  },
}
</script>
