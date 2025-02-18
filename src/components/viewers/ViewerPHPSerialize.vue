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
      isThinkphpSerialize: false,
    };
  },
  components: { JsonEditor },
  computed: {
    newContent() {
      try {
        // 支持 thinkphp 序列化前缀处理
        let rawContent = this.content.toString();
        this.isThinkphpSerialize = rawContent.startsWith('think_serialize:');
        if (this.isThinkphpSerialize) {
          rawContent = rawContent.replace(/^think_serialize:/, '');
        }

        const content = unserialize(rawContent, {}, { strict: false });

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
      let serializedContent = serialize(content);
      // 支持 thinkphp 序列化前缀处理
      if (this.isThinkphpSerialize) {
        serializedContent = `think_serialize:${serializedContent}`;
      }
      return serializedContent;
    },
  },
};
</script>
