<template>
  <div class="text-formated-container">
    <div class="collapse-container">
      <el-button class="collapse-btn" type="text" @click="toggleCollapse">{{ $t('message.' + collapseText) }}</el-button>
    </div>
    <vue-json-pretty
        :path="'res'"
        :data="newContent"
        :deep="maxDeep"
        :showLength=true
        >
      </vue-json-pretty>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import unserialize from 'locutus/php/var/unserialize';

export default {
  data() {
    return {
      maxDeep: 2,
      collapseAllDeep: 0,
      collapsed: true,
      collapseText: 'expand_all',
    };
  },
  components: { VueJsonPretty },
  props: ['data'],
  computed: {
    newContent() {
      try {
        return unserialize(this.$parent.$data.content);
      } catch (e) {
        return this.$t('message.php_unserialize_format_failed');
      }
    },
  },
  methods: {
    toggleCollapse() {
      this.maxDeep = this.collapsed ? Infinity : this.collapseAllDeep;
      this.collapsed = !this.collapsed;

      this.collapseText = this.collapsed ? 'expand_all' : 'collapse_all';
    },
  },
};
</script>
