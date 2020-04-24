<template>
<div class="text-formated-container">
  <div class="collapse-container">
    <el-button class="collapse-btn" type="text" @click="toggleCollapse">{{ $t('message.' + collapseText) }}</el-button>
  </div>
  <vue-json-pretty
    :path="'res'"
    :data="newContent"
    :deep="previousDeep"
    :showLength=true>
  </vue-json-pretty>
</div>
</template>

<script type="text/javascript">
import VueJsonPretty from 'vue-json-pretty';

export default {
  data() {
    return {
      previousDeep: 3,
      collapseText: 'collapse_all',
    };
  },
  components: {VueJsonPretty},
  props: ['content'],
  computed: {
    newContent() {
      try {
        return JSON.parse(this.content);
      } catch (e) {
        return this.$t('message.json_format_failed');
      }
    },
  },
  methods: {
    resetViewer() {
      this.previousDeep = 3;
      this.collapseText = 'collapse_all';
    },
    toggleCollapse() {
      this.previousDeep = this.previousDeep ? 0 : Infinity;
      this.collapseText = this.previousDeep ? 'collapse_all' : 'expand_all';
    },
  },
}
</script>
