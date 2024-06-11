<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='true'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import { ObjectInputStream } from 'java-object-serialization';

export default {
  props: ['content'],
  components: { JsonEditor },
  computed: {
    newContent() {
      try {
        // ref RedisInsight
        const result = (new ObjectInputStream(this.content)).readObject();

        if (typeof result !== 'object') {
          return result;
        }

        const fields = Array.from(result.fields, ([key, value]) => ({ [key]: value }));
        return { ...result, fields };
      } catch (e) {
        return 'Java unserialize failed!';
      }
    },
  },
  methods: {
    getContent() {
      this.$message.error('Java unserialization is readonly now!');
      return false;
    },
    copyContent() {
      return this.$refs.editor.getRawContent();
    },
  },
};
</script>
