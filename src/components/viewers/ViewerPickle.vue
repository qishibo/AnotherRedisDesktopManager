<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='true'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import { Parser } from 'pickleparser';

export default {
  props: ['content'],
  components: { JsonEditor },
  computed: {
    newContent() {
      try {
        return (new Parser()).parse(this.content);
      } catch (e) {
        return 'Pickle parsed failed!';
      }
    },
  },
  methods: {
    getContent() {
      this.$message.error('Pickle is readonly now!');
      return false;
    },
    copyContent() {
      return this.$refs.editor.getRawContent();
    },
  },
};
</script>
