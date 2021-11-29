<template>
  <JsonEditor ref='editor' :content='newContent'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import {unserialize} from 'php-serialize';

export default {
  props: ['content'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        return unserialize(this.content);
      } catch (e) {
        return this.$t('message.php_unserialize_format_failed');
      }
    },
  },
}
</script>
