<template>
<div class="slowlog-container">
  <el-card class="box-card">
    <!-- card title -->
    <div slot="header" class="clearfix">
      <el-popover trigger="hover">
        <i slot="reference" class="el-icon-question"></i>
        Via <b><code>SLOWLOG GET</code></b>, the time threshold is: <b><pre>CONFIG GET slowlog-log-slower-than</pre></b>, and the total number is: <b><pre>CONFIG GET slowlog-max-len</pre></b>
        Unit: <b>μs, 1000μs = 1ms</b>
      </el-popover>

      <span class="card-title">{{ $t('message.slow_log') }}</span>
      <i v-if="isScanning" class='el-icon-loading'></i>
    </div>

    <!-- table header -->
    <div class="table-header">
      <span>
        Command
      </span>
      <span @click="toggleOrder" class="reorder-container" title="Sort">
        <span>Cost</span>
        <span class="el-icon-d-caret"></span>
      </span>
    </div>

    <!-- content list -->
    <RecycleScroller
      v-if="cmdList.length"
      class="list-body"
      :items="cmdList"
      :item-size="24"
      key-field="id"
      v-slot="{ item, index }"
    >
      <li>
        <span class="list-index">{{ index + 1 }}.</span>
        <span class="time" :title="item.timestring">{{ item.timestring.substr(11) }}</span>
        <span class="cmd" :title="item.cmd">{{ item.cmd }}</span>
        <!-- <span class="cost" :title="item.cost">{{ item.cost }} ms</span> -->
        <span class="cost">
          <el-tag size="mini">{{ item.cost }} ms</el-tag>
        </span>
      </li>
    </RecycleScroller>

    <!-- empty list -->
    <div v-else class="list-body empty-list-body">
      <b class="el-icon-star-on"> No Slow Log</b>
    </div>

    <!-- table footer -->
    <div class="table-footer">
      <!-- <el-tag>{{ $t('message.max_display', {num: scanMax}) }}</el-tag> -->
      <el-tag>slowlog-log-slower-than: {{ slowerThan }} &nbsp;&nbsp; slowlog-max-len: {{ maxLen }}</el-tag>
    </div>
  </el-card>
</div>
</template>

<script type="text/javascript">
import { RecycleScroller } from 'vue-virtual-scroller';

export default {
  data() {
    return {
      cmdList: [],
      isScanning: false,
      sortOrder: '',
      scanMax: 20000,
      slowerThan: 0,
      maxLen: 0,
    };
  },
  props: ['client', 'hotKeyScope'],
  components: { RecycleScroller },
  methods: {
    initShow() {
      this.cmdList = [];
      this.isScanning = true;
      this.initCmdList();
      this.initConfig();
    },
    initCmdList() {
      const nodes = this.client.nodes ? this.client.nodes('master') : [this.client];

      nodes.map((node) => {
        const lines = [];
        node.callBuffer('SLOWLOG', 'GET', this.scanMax).then((reply) => {
          for (const item of reply) {
            const line = {
              id: item[0],
              timestring: this.toLocalTime(item[1] * 1000),
              cost: (item[2] / 1000).toFixed(3),
              cmd: item[3].join(' '),
              source: item[4],
              name: item[5],
            };

            lines.push(line);
          }

          this.cmdList = lines;
          this.isScanning = false;
        }).catch((e) => {
          this.isScanning = false;
          this.$message.error(e.message);
        });
      });
    },
    initConfig() {
      this.client.call('CONFIG', 'GET', 'slowlog-log-slower-than').then((reply) => {
        this.slowerThan = reply[1];
      }).catch((e) => {});
      this.client.call('CONFIG', 'GET', 'slowlog-max-len').then((reply) => {
        this.maxLen = reply[1];
      }).catch((e) => {});
    },
    toLocalTime(timestamp) {
      const d = new Date(timestamp);
      const h = `${d.getHours()}`.padStart(2, 0);
      const m = `${d.getMinutes()}`.padStart(2, 0);
      const s = `${d.getSeconds()}`.padStart(2, 0);

      const Y = d.getFullYear();
      const M = `${d.getMonth() + 1}`.padStart(2, 0);
      const D = `${d.getDate()}`.padStart(2, 0);

      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    },
    toggleOrder() {
      if (this.isScanning) {
        return;
      }

      this.sortOrder = (this.sortOrder == 'desc' ? 'asc' : 'desc');
      this.reOrder();
    },
    reOrder(order = null) {
      if (this.sortOrder == 'asc') {
        this.cmdList.sort((a, b) => a.cost - b.cost);
      } else {
        this.cmdList.sort((a, b) => b.cost - a.cost);
      }
    },
    initShortcut() {
      this.$shortcut.bind('ctrl+r, ⌘+r, f5', this.hotKeyScope, () => {
        // scanning not finished, return
        if (this.isScanning) {
          return false;
        }

        this.initShow();
        return false;
      });
    },
  },
  mounted() {
    this.initShow();
    this.initShortcut();
  },
  beforeDestroy() {
    this.$shortcut.deleteScope(this.hotKeyScope);
  },
};
</script>

<style type="text/css">
  .slowlog-container .card-title {
    font-weight: bold;
    font-size: 120%;
  }

  .slowlog-container .table-header {
    margin: 2px 0 14px 0;
    user-select: none;
    display: flex;
    font-weight: bold;
  }
  .slowlog-container .table-header .reorder-container {
    margin-left: auto;
    cursor: pointer;
  }

  /* list body*/
  .slowlog-container .list-body {
    height: calc(100vh - 268px);
    min-height: 100px;
    line-height: 100px;
  }
  .slowlog-container .empty-list-body {
    text-align: center;
  }
  .slowlog-container .list-body li {
    border-bottom: 1px solid #e6e6e6;
    padding: 0 0 0 4px;
    margin-right: 2px;
    font-size: 92%;
    list-style: none;
    display: flex;
    /*same with item-size*/
    line-height: 24px;
  }
  .slowlog-container .list-body .time {
    width: 88px;
  }
  .slowlog-container .list-body .cmd {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .slowlog-container .list-body .cost {
    font-size: 90%;
    margin-left: 16px;
    margin-right: 4px;
  }

  .dark-mode .slowlog-container .list-body li {
    border-bottom: 1px solid #3b4d57;
  }
  .slowlog-container .list-body li:hover {
    background: #e6e6e6;
  }
  .dark-mode .slowlog-container .list-body li:hover {
    background: #3b4d57;
  }

  /* table footer*/
  .slowlog-container .table-footer {
    text-align: center;
    line-height: 40px;
  }
</style>
