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

export default{
  data() {
    return {
      maxDeep: 2,
      maxDeepDefault: 2,
      collapsed: true,
      collapseText: 'expand_all'
    };
  },
  components: {VueJsonPretty},
  props: ['content'],
  computed: {
    newContent() {
      try {
        return unserialize(this.content.content);
      }
      catch (e) {
        return 'PHP Unserialize Failed, Please Check Data Format!';
      }
    }
  },
  methods: {
    toggleCollapse() {
      this.maxDeep = this.collapsed ? Infinity : 1;
      this.collapsed = !this.collapsed;

      this.collapseText = this.collapsed ? 'expand_all' : 'collapse_all';
    }
  }
};
</script>
