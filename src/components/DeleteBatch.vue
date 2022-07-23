<template>
<div>
  <el-card class="box-card del-batch-card">
    <!-- card title -->
    <div slot="header" class="clearfix">
      <span class="del-title">{{ $t('message.keys_to_be_deleted') }}</span>
      <i v-if="loadingScan||loadingDelete" class='el-icon-loading'></i>
      <el-tag size="mini">
        <span v-if="loadingScan">Scanning... </span>
        <span v-if="loadingDelete">Deleting... </span>
        Total: {{ allKeysList.length }}
      </el-tag>

      <!-- del btn -->
      <el-button @click="confirmDelete" :disabled="loadingScan||loadingDelete||allKeysList.length == 0" style="float: right;" type="danger">{{ $t('message.delete_all') }}</el-button>
      <!-- toggle scanning btn -->
      <el-button v-if="rule.pattern.length && !scanningEnd" @click="toggleScanning" type="text" style="float: right;">{{loadingScan ? $t('message.pause') : $t('message.begin')}}</el-button>
    </div>

    <!-- scan pattern -->
    <el-tag v-if="rule.pattern && rule.pattern.length" style="margin-left: 10px;">
      <i class="el-icon-search"></i> {{rule.pattern.join(' ')}}
    </el-tag>

    <!-- key list -->
    <ol class="del-batch-key-list-ol">
      <li v-for="item, index in allKeysList" :key="index">{{ item[0] }}</li>
    </ol>
  </el-card>
  <ScrollToTop parentNum='1'></ScrollToTop>
</div>
</template>

<script type="text/javascript">
import ScrollToTop from '@/components/ScrollToTop';

export default {
  data() {
    return {
      patternKeys: [],
      loadingScan: false,
      loadingDelete: false,
      scanStreams: [],
      allKeysList: [],
      scanningEnd: false,
    };
  },
  props: ['client', 'rule', 'hotKeyScope'],
  components: { ScrollToTop },
  methods: {
    initKeys() {
      let keys = [];

      if (this.rule.key && this.rule.key.length) {
        for (let key of this.rule.key) {
          keys.push([this.$util.bufToString(key), key]);
        }
      }

      this.allKeysList = keys;

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
          count: 20000,
        }

        let stream = node.scanBufferStream(scanOption);
        this.scanStreams.push(stream);

        stream.on('data', keys => {
          this.addToList(keys.sort());

          if (!this.loadingScan) {
            return stream.pause();
          }

          // pause for dom rendering
          stream.pause();
          setTimeout(() => {
            this.loadingScan && stream.resume();
          }, 100);
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
            this.scanningEnd = true;
          }
        });
      });
    },
    addToList(keys) {
      let list = [];
      for (const key of keys) {
        list.push([this.$util.bufToString(key), key]);
      }

      this.allKeysList = this.allKeysList.concat(list);
    },
    stopScanning() {
      this.loadingScan = false;

      if (this.scanStreams.length) {
        for (let stream of this.scanStreams) {
          stream.pause();
        }
      }
    },
    toggleScanning() {
      this.loadingScan = !this.loadingScan;

      // resume scanning
      if (this.loadingScan) {
        if (this.scanStreams.length) {
          for (let stream of this.scanStreams) {
            stream.resume();
          }
        }
      }
    },
    confirmDelete() {
      let keys = this.allKeysList;
      let total = keys.length;

      if (total <= 0) {
        return;
      }

      this.loadingDelete = true;
      let delPromise = null;

      // standalone Redis, batch delete
      if (!this.client.nodes) {
        let chunked = [];
        for (let i = 0; i < total; i++) {
          chunked.push(keys[i][1]);

          // del 5000 keys one time
          if (chunked.length >= 5000) {
            delPromise = this.client.del(chunked);
            chunked = [];
          }
        }

        if (chunked.length) {
          delPromise = this.client.del(chunked);
        }
        // use final promise
        delPromise.then((reply) => {
          if (reply > 0) {
            this.afterDelete();
          }
          else {
            this.deleteFailed(this.$t('message.delete_failed'));
          }
        }).catch(e => {
          this.deleteFailed(e.message);
        });
      }

      // cluster, one key per time instead of batch
      else {
        for (let i = 0; i < total; i++) {
          delPromise = this.client.del(keys[i][1]);
          delPromise.catch(e => {});
        }

        // use final promise
        delPromise.then((reply) => {
          if (reply === 1) {
            this.afterDelete();
          }
          else {
            this.deleteFailed(this.$t('message.delete_failed'));
          }
        }).catch(e => {
          this.deleteFailed(e.message);
        });
      }
    },
    afterDelete() {
      this.loadingDelete = false;
      this.allKeysList = [];

      // empty the specified keys
      // this.rule.key = [];

      this.$message.success(this.$t('message.delete_success'));
      this.$bus.$emit('refreshKeyList', this.client);

      // except pattern mode scanning not to end, close pre tab
      if (!this.rule.pattern.length || this.scanningEnd) {
        this.$bus.$emit('removePreTab');
      }
    },
    deleteFailed(msg = '') {
      msg && this.$message.error(msg);

      this.loadingScan = false;
      this.loadingDelete = false;
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
    // disable f5 for streams on event cannot stop
    // this.initShortcut();
  },
  beforeDestroy() {
    // this.$shortcut.deleteScope(this.hotKeyScope);
    // cancel scanning
    this.stopScanning();
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
