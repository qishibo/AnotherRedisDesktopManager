<template>
  <JsonEditor ref='editor' :content='newContent'></JsonEditor>
</template>

<script type="text/javascript">
import JsonEditor from '@/components/JsonEditor';
import {decode} from "@msgpack/msgpack";

export default {
  props: ['content'],
  components: {JsonEditor},
  computed: {
    newContent() {
      try {
        return decode(this.content);
      } catch (e) {
        return this.$t('message.msgpack_format_failed');
      }
    },
  },
}
</script>
