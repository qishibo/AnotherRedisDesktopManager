<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='disabled||false'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
const JSONbig = require('@qii404/json-bigint')({useNativeBigInt: false});

export default {
  props: ['content', 'disabled'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        const parsedObj = JSONbig.parse(this.content);
        // if JSON.parse returns string, means raw content like "{\"name\":\"age\"}"
        // (JSON string wrapped with quotation) issue #909
        if (typeof parsedObj === 'string') {
          this.jsonIsString = true;
        }
        return parsedObj;
      } catch (e) {
        // parse failed, return raw content to edit instead of error
        return this.content.toString();
      }
    },
  },
  methods: {
    getContent() {
      const content = this.$refs.editor.getContent();

      if (!content) {
        return false;
      }

      // json in string, quotation wrapped and escaped,
      if (this.jsonIsString) {
        return JSONbig.stringify(content.toString());
      }

      return content;
    },
  },
}
</script>
