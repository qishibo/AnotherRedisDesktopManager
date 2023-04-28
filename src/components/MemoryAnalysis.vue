<template>
<div class="memory-analysis-container">
  <el-card class="box-card">
    <!-- card title -->
    <div slot="header" class="clearfix">
      <el-popover trigger="hover">
        <i slot="reference" class="el-icon-question"></i>
        If size is "0", your Redis may disabled <b>MEMORY</b> command.
      </el-popover>
      
      <span class="analysis-title">{{ $t('message.memory_analysis') }}</span>
      <i v-if="isScanning" class='el-icon-loading'></i>
      <el-tag size="mini">
        <span v-if="isScanning">Scanning...</span>
        Total: {{keysList.length}} &nbsp;
        Size: {{$util.humanFileSize(totalSize)}}
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
    <div class="keys-header">
      <span class="header-title">
        Key
        <el-tag v-if="pattern" size="mini"><i class="fa fa-search"></i> {{pattern}}</el-tag>
      </span>
      <span @click="toggleOrder" class="size-container">
        <span class="header-title">Size</span>
        <span class="el-icon-d-caret"></span>
      </span>
    </div>

    <!-- keys list -->
    <RecycleScroller
      class="keys-body"
      :items="keysList"
      :item-size="20"
      key-field="str"
      v-slot="{ item, index }"
    >
      <li @click="clickJump(item)">
        <span class="list-index">{{ index + 1 }}.</span>
        <span class="key-name" :title="item.str">{{ item.str }}</span>
        <span class="size">{{ item.human }}</span>
      </li>
    </RecycleScroller>

    <!-- table footer -->
    <div class="keys-footer">
      <el-tag>{{ $t('message.max_display', {num: scanMax}) }}</el-tag>
    </div>
  </el-card>
</div>
</template>

<script type="text/javascript">
import { RecycleScroller } from 'vue-virtual-scroller'

export default {
  data() {
    return {
      keysList: [],
      isScanning: false,
      scanningEnd: false,
      scanStreams: [],
      sortOrder: '',
      scanMax: 200000,
      scanPageSize: 2000,
      totalSize: 0,
    };
  },
  props: ['client', 'hotKeyScope', 'pattern'],
  components: { RecycleScroller },
  methods: {
    initKeys() {
      this.keysList = [];
      this.totalSize = 0;
      this.isScanning = true;
      this.scanningEnd = false;
      this.initScanStreamsAndScan(this.pattern ? this.pattern : '');
    },
    initScanStreamsAndScan(pattern = '') {
      const nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
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
              this.keysList = this.keysList.concat(keysWithMemory);
              this.reOrder('desc');
              this.isScanning && stream.resume();
            }, 100);

            // size count
            this.totalSize += keysWithMemory.reduce((sum, item) => sum + parseInt(item.size), 0);
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
          keysWithMemory.push({
            key: key, str: this.$util.bufToString(key), size: reply, human: this.$util.humanFileSize(reply),
          });
        }).catch(e => {
          keysWithMemory.push({
            key: key, str: this.$util.bufToString(key), size: 0, human: 0,
          });
        });

        allPromise.push(promise);
      }

      return Promise.all(allPromise);
    },
    clickJump(item) {
      this.$bus.$emit('clickedKey', this.client, item.key, true);
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
    toggleOrder() {
      if (this.isScanning) {
        return;
      }

      this.sortOrder = (this.sortOrder == 'desc' ? 'asc' : 'desc');
      this.reOrder();
    },
    reOrder(order = null) {
      order !== null && (this.sortOrder = order);

      // sorting
      if (this.sortOrder == 'asc') {
        this.keysList.sort((a, b) => {
          return a.size - b.size;
        });
      }
      else {
        this.keysList.sort((a, b) => {
          return b.size - a.size;
        });
      }
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

  /*keys header container*/
  .memory-analysis-container .keys-header {
    margin: 2px 0 14px 0;
    user-select: none;
  }
  .memory-analysis-container .keys-header .header-title {
    font-weight: bold;
  }
  .memory-analysis-container .keys-header .size-container {
    float: right;
    cursor: pointer;
  }

  /*keys body list*/
  .memory-analysis-container .keys-body {
    height: calc(100vh - 290px);
  }
  /*keys body li*/
  .memory-analysis-container .keys-body li {
    border-bottom: 1px solid #d0d0d0;
    cursor:  pointer;
    padding: 0 2px;
    font-size: 92%;
    list-style: none;
    display: flex;
  }
  .dark-mode .memory-analysis-container .keys-body li {
    border-bottom: 1px solid #444444;
  }
  .memory-analysis-container .keys-body li:hover {
    background: #c6c6c6;
  }
  .dark-mode .memory-analysis-container .keys-body li:hover {
    background: #3b4e57;
  }
  /*key name*/
  .memory-analysis-container .keys-body li .key-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*key size*/
  .memory-analysis-container .keys-body .size {
    font-size: 90%;
    margin-left: 20px;
    margin-right: 4px;
  }

  /*keys footer*/
  .memory-analysis-container .keys-footer {
    text-align: center;
  }
</style>
