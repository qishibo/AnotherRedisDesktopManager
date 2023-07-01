<template>
  <div>
    <!-- key list -->
    <component
      :is="keyListType"
      :config="config"
      :client="client"
      :keyList="keyList"
      @exportBatch="exportBatch">
    </component>

    <div class='keys-load-more-wrapper'>
      <!-- load more -->
      <el-button
        ref='scanMoreBtn'
        class='load-more-keys'
        :icon="searching && !loadingAll ? 'el-icon-loading' : ''"
        :disabled='scanMoreDisabled || searching'
        @click='refreshKeyList(false)'>
        {{ $t('message.load_more_keys') }}
      </el-button>

      <!-- load all -->
      <!-- fix el-tooltip 200ms delay when closing -->
      <el-tooltip v-if='showLoadAllKeys' :disabled="!loadAllTooltip"
        @mouseenter.native="loadAllTooltip=true" @mouseleave.native="loadAllTooltip=false"
        effect="dark" :content="$t('message.load_all_keys_tip')"
        placement="bottom" :open-delay=380 :enterable='false'>
        <el-button
          class='load-more-keys'
          type= 'danger'
          :icon="searching && loadingAll ? 'el-icon-loading' : ''"
          :disabled='searching'
          @click='loadAllKeys()'>
          {{ $t('message.load_all_keys') }}
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script type="text/javascript">
import KeyListVirtualTree from '@/components/KeyListVirtualTree';

export default {
  data() {
    return {
      keyList: [],
      keyListType: 'KeyListVirtualTree',
      searchPageSize: 10000,
      scanStreams: [],
      scanningCount: 0,
      scanMoreDisabled: false,
      onePageKeysCount: 0,
      loadAllTooltip: true,
      loadingAll: false,
    };
  },
  props: ['client', 'config', 'globalSettings'],
  components: {KeyListVirtualTree},
  computed: {
    keysPageSize() {
      let keysPageSize = parseInt(this.globalSettings['keysPageSize']);

      // custom defined size
      if (keysPageSize) {
        // cluster mode, pageSize = size / masterNodes
        if (this.client.nodes) {
          let nodeCount = this.client.nodes('master').length;
          return nodeCount ? parseInt(keysPageSize / nodeCount) : keysPageSize;
        }

        // common mode
        return keysPageSize;
      }

      return 500;
    },
    showLoadAllKeys(){
      // force show
      return true;
      return this.globalSettings['showLoadAllKeys'];
    },
    searching() {
      return this.$parent.$parent.$parent.$refs.operateItem.searchIcon == 'el-icon-loading';
    },
  },
  created() {
    // add or remove key from key list directly
    this.$bus.$on('refreshKeyList', (client, key = '', type = 'del') => {
      // refresh only self connection key list
      if (client !== this.client) {
        return;
      }

      // refresh directly
      if (!key) {
        return this.refreshKeyList();
      }

      (type == 'del') && this.removeKeyFromKeyList(key);
      (type == 'add') && this.addKeyToKeyList(key);
    });
  },
  methods: {
    initShow() {
      this.refreshKeyList();
    },
    setDb(db) {
      (this.client.condition.select != db) && this.client.select(db);
    },
    refreshKeyList(resetKeyList = true) {
      // reset previous list, not append mode
      resetKeyList && this.resetKeyList();

      // show searching status
      this.setSearchStatus();

      // extract search
      if (this.$parent.$parent.$parent.$refs.operateItem.searchExact === true) {
        return this.refreshKeyListExact();
      }

      // init scanStream
      if (!this.scanStreams.length) {
        this.initScanStreamsAndScan();
      }

      // scan more, resume previous scanStream
      else {
        // reset one page scan param
        this.onePageKeysCount = 0;

        for (var stream of this.scanStreams) {
          stream.resume();
        }
      }
    },
    loadAllKeys(){
      this.resetKeyList();
      this.loadingAll = true;

      // show searching status
      this.setSearchStatus();
      this.initScanStreamsAndScan(true);
    },
    initScanStreamsAndScan(loadAll = false) {
      let nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
      let keysPageSize = loadAll ? 50000 : this.keysPageSize;
      this.scanningCount = nodes.length;

      nodes.map(node => {
        let scanOption = {
          match: this.getMatchMode(),
          count: keysPageSize,
        }

        // scan count is bigger when in search mode
        scanOption.match != '*' && (scanOption.count = this.searchPageSize);

        let stream = node.scanBufferStream(scanOption);
        this.scanStreams.push(stream);

        stream.on('data', keys => {
          if (!keys.length) {
            return;
          }

          this.keyList = this.keyList.concat(keys);
          this.onePageKeysCount += keys.length;

          // scan once reaches page size
          if (this.onePageKeysCount >= keysPageSize && loadAll === false) {
            // temp stop
            stream.pause();
            this.resetSearchStatus();
          }
        });

        stream.on('error', (e) => {
          this.resetSearchStatus();

          // scan command disabled, other functions may be used normally
          if (
            (e.message.includes('unknown command') && e.message.includes('scan')) ||
            e.message.includes("command 'SCAN' is not allowed")
          ) {
            return this.$message.error({
              message: this.$t('message.scan_disabled'),
              duration: 1500,
            });
          }

          // other errors
          this.$message.error({
            message: 'Stream On Error: ' +  e.message,
            duration: 1500,
          });

          setTimeout(() => {
            this.$bus.$emit('closeConnection');
          }, 50);
        });

        stream.on('end', () => {
          // all nodes scan finished(cusor back to 0)
          if (--this.scanningCount <= 0) {
            this.scanMoreDisabled = true;
            this.resetSearchStatus();
          }
        });
      });
    },
    resetKeyList() {
      // cancel scanning
      this.cancelScanning();
      this.keyList = [];
      this.scanStreams = [];
      this.onePageKeysCount = 0;
      this.scanMoreDisabled = false;
      this.loadingAll = false;
    },
    setSearchStatus() {
      // search loading
      this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-loading';
      // show cancel scanning btn after scanning for a while
      this.$parent.$parent.$parent.$refs.operateItem.toggleCancelIcon(true);
    },
    resetSearchStatus() {
      // search input icon recover
      this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';
      // remove cancel scanning btn
      this.$parent.$parent.$parent.$refs.operateItem.toggleCancelIcon(false);
      // reset loading all status
      this.loadingAll = false;
    },
    refreshKeyListExact() {
      const match = this.getMatchMode(false);

      this.client.exists(match).then((reply) => {
        this.keyList = (reply == 1) ? [Buffer.from(match)] : [];
      }).catch(e => {
        this.$message.error(e.message);
      }).finally(() => {
        this.scanMoreDisabled = true;
        this.resetSearchStatus();
      });
    },
    cancelScanning() {
      if (this.scanStreams.length) {
        for (let stream of this.scanStreams) {
          stream.pause && stream.pause();
        }
      }
    },
    getMatchMode(fillStar = true) {
      let match = this.$parent.$parent.$parent.$refs.operateItem.searchMatch;

      match = match || '*';

      if (fillStar && !match.match(/\*/)) {
        match = (`*${match}*`);
      }

      return match;
    },
    removeKeyFromKeyList(key) {
      if (!this.keyList) {
        return false;
      }

      for (let i in this.keyList) {
        if (this.keyList[i].equals(key)) {
          this.keyList.splice(i, 1);
          break;
        }
      }
    },
    addKeyToKeyList(key) {
      if (!this.keyList) {
        return false;
      }

      for (let i in this.keyList) {
        if (this.keyList[i].equals(key)) {
          // exists already
          return;
        }
      }

      this.keyList.push(key);
    },
    exportBatch(keys) {
      let lines = [];
      let failed = [];
      let promiseQueue = [];

      for (const key of keys) {
        const promise = this.client.callBuffer('DUMP', key);
        promiseQueue.push(promise);
      }

      Promise.allSettled(promiseQueue).then(reply => {
        for (const index in reply) {
          const item = reply[index];

          if (item.status === "fulfilled") {
            const line = `${keys[index].toString('hex')},${item.value.toString('hex')}`;
            lines.push(line);
          }
          // dump failed
          else {
            failed.push(keys[index]);
          }
        }

        // save to file
        const file = `Dump_${(new Date).toISOString().substr(0, 10).replaceAll('-', '')}.csv`
        this.$util.createAndDownloadFile(file, lines.join('\n'));
      });
    }
  },
  watch: {
    globalSettings(newSetting, oldSetting) {
      if (!this.client) {
        return;
      }
      // keys number changed, reload scan streams
      if (newSetting.keysPageSize != oldSetting.keysPageSize) {
        this.refreshKeyList();
      }
    },
  },
}
</script>

<style type="text/css">
  .keys-load-more-wrapper {
    display: flex;
  }
  .keys-load-more-wrapper .load-more-keys {
    margin: 10px 5px;
    padding: 0;
    display: block;
    height: 22px;
    width: 100%;
    font-size: 75%;
  }

</style>
