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
      if (this.$util.isJson(this.brotliStr)) {
        let JSONbig = require('json-bigint')({storeAsString: true});
        let jsonSolved = JSONbig.stringify(JSONbig.parse(this.brotliStr));
        
        return JSON.parse(jsonSolved);
      }

      return this.brotliStr;
    },
    brotliStr() {
      try {
        return this.$util.brotliToString(this.content);
      } catch(e) {
        return 'Brotli Parse Failed: ' + e.message;
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
    copyContent() {
      return this.brotliStr;
    }
  },
}
</script>
