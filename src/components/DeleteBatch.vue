<template>
<div>
  <el-card v-loading="loadingDelete||loadingScan" class="box-card del-batch-card">
    <!-- card title -->
    <div slot="header" class="clearfix">
      <span class="del-title">{{ $t('message.keys_to_be_deleted') }}</span>
      <i v-if="loadingScan||loadingDelete" class='el-icon-loading'></i>
      <el-tag size="mini">
        <span v-if="loadingScan">Scanning... </span>
        <span v-if="loadingDelete">Deleting... </span>
        Total: {{ Object.keys(allKeys).length }}
      </el-tag>

      <el-button @click="confirmDelete" :disabled="loadingScan||loadingDelete" style="float: right;" type="danger">{{ $t('message.delete_all') }}</el-button>
    </div>

    <!-- key list -->
    <ol class="del-batch-key-list-ol">
      <li v-for="key, index in Object.keys(allKeys)" :key="index">{{ key }}</li>
    </ol>
  </el-card>
</div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      patternKeys: [],
      loadingScan: false,
      loadingDelete: false,
    };
  },
  props: ['client', 'rule', 'hotKeyScope'],
  computed: {
    allKeys() {
      let dict = this.specifyKeys;

      for (let key of this.patternKeys) {
        dict[this.$util.bufToString(key)] = key;
      }

      return dict;
    },
    specifyKeys() {
      let dict = {};

      if (this.rule.key && this.rule.key.length) {
        for (let key of this.rule.key) {
          dict[this.$util.bufToString(key)] = key;
        }
      }

      return dict;
    },
  },
  methods: {
    initKeys() {
      this.patternKeys = [];

      if (this.rule.pattern && this.rule.pattern.length) {
        this.loadingScan = true;

        for (let pattern of this.rule.pattern) {
          this.initScanStreamsAndScan(pattern);
        }
      }
    },
    initScanStreamsAndScan(pattern) {
      let nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
      this.scanningCount = nodes.length;

      nodes.map(node => {
        let scanOption = {
          match: pattern + '*',
          count: 7000,
        }

        let stream = node.scanBufferStream(scanOption);

        stream.on('data', keys => {
          this.patternKeys = this.patternKeys.concat(keys.sort());
        });

        stream.on('error', (e) => {
          this.loadingScan = false;
          this.$message.error({
            message: 'Delete Batch Stream On Error: ' +  e.message,
            duration: 1500,
          });
        });

        stream.on('end', () => {
          // all nodes scan finished(cusor back to 0)
          if (--this.scanningCount <= 0) {
            this.loadingScan = false;
          }
        });
      });
    },
    confirmDelete() {
      this.loadingDelete = true;

      let keys = Object.values(this.allKeys);
      let total = keys.length;
      let last = total - 1;

      // one key per time instead of batch is for cluster...
      for (let i = 0; i < total; i++) {
        let promise = this.client.del(keys[i]);
        // just wait the last one
        if (i === last) {
          promise.then((reply) => {
            this.loadingDelete = false;

            if (reply === 1) {
              this.$message.success(this.$t('message.delete_success'));
              this.$bus.$emit('removePreTab');
              this.$bus.$emit('refreshKeyList', this.client);
            }
            else {
              this.$message.error(this.$t('message.delete_failed'));
            }
          }).catch(e => {
            this.loadingScan = false;
            this.loadingDelete = false;
            this.$message.error(e.message);
          });
        }
      }
    },
    initShortcut() {
      this.$shortcut.bind('ctrl+r, ⌘+r, f5', this.hotKeyScope, () => {
        this.initKeys();
        return false;
      });
    },
  },
  mounted() {
    this.initKeys();
    this.initShortcut();
  },
  beforeDestroy() {
    this.$shortcut.deleteScope(this.hotKeyScope);
  },
};
</script>

<style type="text/css" >
  .del-title {
    color: #f56c6c;
    font-weight: bold;
    font-size: 120%;
  }
  .del-batch-card {
    margin-top: 10px;
  }
  .del-batch-key-list-ol {
    min-height: calc(100vh - 272px);
    overflow: auto;
    padding-left: 10px;
    list-style-position: inside;
  }
  .del-batch-key-list-ol li {
    color: #333;
    font-size: 92%;
  }
  .dark-mode .del-batch-key-list-ol li {
    color: #f7f7f7;
  }

  .del-batch-card .el-loading-mask {
    /*opacity: 0.3;*/
    /*background: #263238;*/
    background: rgba(38, 50, 56, .3);
  }
  .del-batch-card .el-loading-spinner {
    top: 200px;
  }
</style>
