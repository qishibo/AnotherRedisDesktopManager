<template>
<div class="text-formated-container">
  <div class="collapse-container">
    <el-button class="collapse-btn" type="text" @click="toggleCollapse">{{ $t('message.' + collapseText) }}</el-button>
  </div>
  <JsonViewer
    v-if='show'
    :value="newContent"
    :expand-depth="previousDeep"
    >
  </JsonViewer>
</div>
</template>

<script type="text/javascript">
import JsonViewer from 'vue-json-viewer'
import {decode} from "@msgpack/msgpack";

export default {
  data() {
    return {
      show: true,
      previousDeep: 3,
      collapseText: 'collapse_all',
    };
  },
  components: {JsonViewer},
  props: ['content'],
  computed: {
    newContent() {
      try {
        return decode(this.content);
      } catch (e) {
        return this.$t('message.msgpack_format_failed');
      }
    },
  },
  methods: {
    toggleCollapse() {
      this.previousDeep = this.previousDeep ? 0 : Infinity;
      this.collapseText = this.previousDeep ? 'collapse_all' : 'expand_all';

      // reload json tree
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
  },
}
</script>
