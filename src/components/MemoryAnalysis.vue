<template>
<div class="memory-analysis-container">
  <el-card class="box-card">
    <!-- card title -->
    <div slot="header" class="clearfix">
      <span class="analysis-title">{{ $t('message.memory_analysis') }}</span>
      <i v-if="isScanning" class='el-icon-loading'></i>
      <el-tag size="mini">
        <span v-if="isScanning">Scanning...</span>
        Total: {{keysList.length}}
      </el-tag>

      <!-- operate btn -->
      <el-button v-if="scanningEnd" @click="initKeys" class="operate-btn" type="primary">
        <i class="fa fa-refresh"> {{ $t('message.restart') }}</i>
      </el-button>
      <el-button v-else-if="isScanning" @click="toggleScanning(true)" class="operate-btn" type="danger">
        <i class="fa fa-pause"> {{ $t('message.pause') }}</i>
      </el-button>
      <el-button v-else @click="toggleScanning(false)" class="operate-btn">
        <i class="fa fa-play"> {{ $t('message.begin') }}</i>
      </el-button>
    </div>

    <!-- table header -->
    <ol class="keys-header">
      <li>
        <span class="header-title">Key</span>
        <span class="size-container">
          <el-popover trigger="hover">
            <i slot="reference" class="el-icon-question"></i>
            If size is "unknown", your Redis may disabled <b><code>MEMORY</code></b> command.
          </el-popover>
          <span class="header-title">Size (bytes)</span>
          <span @click="reOrder" class="el-icon-d-caret" style="cursor: pointer;"></span>
        </span>
      </li>
    </ol>

    <!-- table list -->
    <ol ref='keysList' class='keys-body'></ol>

    <!-- table footer -->
    <div class="keys-footer">
      <el-tag>{{ $t('message.max_display', {num: showMax}) }}</el-tag>
    </div>
  </el-card>

  <ScrollToTop parentNum='1'></ScrollToTop>
</div>
</template>

<script type="text/javascript">
import ScrollToTop from '@/components/ScrollToTop';

export default {
  data() {
    return {
      keysList: [],
      isScanning: false,
      scanningEnd: false,
      scanStreams: [],
      sortOrder: '',
      scanMax: 200000,
      showMax: 10000,
      scanPageSize: 2000,
    };
  },
  props: ['client', 'hotKeyScope'],
  components: { ScrollToTop },
  methods: {
    initKeys() {
      this.keysList = [];
      this.$refs.keysList.innerHTML = '';
      this.isScanning = true;
      this.scanningEnd = false;
      this.initScanStreamsAndScan();
    },
    initScanStreamsAndScan(pattern = '') {
      const nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
      const keysListDom = this.$refs.keysList;
      this.scanningCount = nodes.length;

      nodes.map(node => {
        const scanOption = {
          match: pattern + '*',
          count: this.scanPageSize,
        }

        const stream = node.scanBufferStream(scanOption);
        this.scanStreams.push(stream);

        stream.on('data', keys => {
          // waiting for memory analysis
          stream.pause();

          // limit scanning max count
          if (this.keysList.length > this.scanMax) {
            this.$message.warning(this.$t('message.max_scan', {num: this.scanMax}) + ', stopped.');
            this.scanningEnd = true;
            return this.toggleScanning(true);
          }

          let keysWithMemory = []
          const promise = this.initKeysMemory(keys, keysWithMemory);

          promise.then(() => {
            // add interval between rendering
            setTimeout(() => {
              // limit show max
              if (keysListDom.querySelectorAll('li').length < this.showMax) {
                this.insertIntoDom(keysWithMemory, false);
              }

              this.keysList = this.keysList.concat(keysWithMemory);
              this.isScanning && stream.resume();
            }, 100);
          });
        });

        stream.on('error', e => {
          this.toggleScanning(true);
          this.$message.error('Memory Analysis Stream On Error: ' +  e.messag);
        });

        stream.on('end', () => {
          // all nodes scan finished(cusor back to 0)
          if (--this.scanningCount <= 0) {
            this.isScanning = false;
            this.scanningEnd = true;
          }
        });
      });
    },
    // todo: should avoid logging too many commands!
    initKeysMemory(keys, keysWithMemory) {
      if (!keys) {
        return;
      }

      let allPromise = [];

      for (let key of keys) {
        // not logging
        this.client.withoutLogging = true;
        const promise = this.client.call('MEMORY', 'USAGE', key).then(reply => {
          keysWithMemory.push([key, reply]);
        }).catch(e => {
          keysWithMemory.push([key, 'unknown']);
        });

        allPromise.push(promise);
      }

      return Promise.all(allPromise);
    },
    insertIntoDom(keysList, clearHTML = false) {
      if (!keysList || keysList.length == 0) {
        return;
      }

      const flag = document.createDocumentFragment();
      const keysListDom = this.$refs.keysList;

      if (!keysListDom) {
        return;
      }

      for (const item of keysList) {
        const li = document.createElement('li');
        const byte = document.createElement('span');
        li.textContent = item[0]; // key
        byte.textContent = item[1]; // byte
        li.appendChild(byte);

        flag.appendChild(li);
      }

      clearHTML && (keysListDom.innerHTML = '');
      keysListDom.appendChild(flag);
    },
    toggleScanning(pause = true) {
      // stop scanning
      if (pause) {
        this.isScanning = false;
        if (this.scanStreams.length) {
          for (let stream of this.scanStreams) {
            stream.pause && stream.pause();
          }
        }

        return;
      }

      if (this.scanningEnd) {
        return;
      }

      // resume scanning
      this.isScanning = true;
      if (this.scanStreams.length) {
        for (let stream of this.scanStreams) {
          stream.pause && stream.resume();
        }
      }
    },
    reOrder() {
      if (this.isScanning) {
        return;
      }

      this.sortOrder = this.sortOrder == 'desc' ? 'asc' : 'desc';

      // sorting
      if (this.sortOrder == 'asc') {
        this.keysList.sort((a, b) => {
          return a[1] - b[1];
        });
      }
      else {
        this.keysList.sort((a, b) => {
          return b[1] - a[1];
        });
      }

      // limit max display keys
      const showKeys = this.keysList.slice(0, this.showMax);
      this.insertIntoDom(showKeys, true);
    },
    initShortcut() {
      this.$shortcut.bind('ctrl+r, ⌘+r, f5', this.hotKeyScope, () => {
        // scanning not finished, return
        if (!this.scanningEnd) {
          return false;
        }

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
    this.toggleScanning(true);
  },
};
</script>

<style type="text/css">
  .memory-analysis-container .analysis-title {
    font-weight: bold;
    font-size: 120%;
  }
  .memory-analysis-container .operate-btn {
    float: right;
  }

  /*keys header*/
  .memory-analysis-container .keys-header {
    list-style: none;
  }
  .memory-analysis-container .keys-header .header-title {
    font-weight: bold;
  }
  .memory-analysis-container .keys-header .size-container {
    float: right;
  }

  /*keys body li*/
  .memory-analysis-container .keys-body li {
    border-bottom: 1px solid #d0d0d0;
  }
  .dark-mode .memory-analysis-container .keys-body li {
    border-bottom: 1px solid #444444;
  }
  /*key size*/
  .memory-analysis-container .keys-body span {
    float: right;
    font-size: 90%;
  }

  /*keys footer*/
  .memory-analysis-container .keys-footer {
    text-align: center;
  }
</style>
