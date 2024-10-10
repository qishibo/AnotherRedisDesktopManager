<template>
  <JsonEditor ref='editor' :content='newContent' :readOnly='isPHPClass'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import { unserialize, serialize } from 'php-serialize';


export default {
  props: ['content'],
  data() {
    return {
      isPHPClass: false,
    };
  },
  components: { JsonEditor },
  computed: {
    newContent() {
      try {
        const content = unserialize(this.content, {}, { strict: false });

        if (content && content['__PHP_Incomplete_Class_Name']) {
          this.isPHPClass = true;
        }

        return content;
      } catch (e) {
        return this.$t('message.php_unserialize_format_failed');
      }
    },
  },
  methods: {
    getContent() {
      let content = this.$refs.editor.getRawContent();

      // raw content is an object
      if (typeof this.newContent !== 'string') {
        try {
          content = JSON.parse(content);
        } catch (e) {
          // object parse failed
          this.$message.error({
            message: `Raw content is an object, but now parse object failed: ${e.message}`,
            duration: 6000,
          });

          return false;
        }
      }

      return serialize(content);
    },
  },
};
</script>
