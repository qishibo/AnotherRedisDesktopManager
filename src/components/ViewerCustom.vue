<template>
  <div class="text-formated-container">
    <div class="collapse-container">
      <el-button class="collapse-btn" type="text" @click="toggleCollapse">{{
          $t('message.' + collapseText)
        }}
      </el-button>
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
import storage from '@/storage.js';
import JsonViewer from 'vue-json-viewer';
import shell from 'child_process';

export default {
  data() {
    return {
      show: true,
      previousDeep: 3,
      collapseText: 'collapse_all',
      parsedContent: '',
    };
  },
  components: { JsonViewer },
  props: ['content', 'name', 'redisKeyField', 'redisKey'],
  computed: {
    newContent() {
      try {
        // use custom formatter
        shell.exec(this.getShell(), (e, stdout, stderr) => {
          if (stderr !== '') {
            this.parsedContent = e.message;
            return;
          }
          let JSONbig = require('json-bigint')({ storeAsString: true });
          let jsonSolved = JSONbig.stringify(JSONbig.parse(stdout));
          this.parsedContent = JSON.parse(jsonSolved);
        });
        return this.parsedContent;
      } catch (e) {
        return this.$t('message.json_format_failed');
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
    getShell() {
      let settings = storage.getSetting();
      for (let i = 0; i < settings.formatters.length; ++i) {
        const formatter = settings.formatters[i];
        if (formatter.name === this.name) {
          return `${formatter.formatter} ${this.redisKey} ${this.redisKeyField} '${this.content}'`;
        }
      }
    },
  },
};
</script>
