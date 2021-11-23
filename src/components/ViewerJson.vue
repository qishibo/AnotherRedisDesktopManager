<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='false'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const JSONbig = require('json-bigint')({storeAsString: true});

export default {
  props: ['content'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        // change bigint to string
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
