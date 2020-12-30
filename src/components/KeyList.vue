<template>
  <div>
    <!-- key list -->
    <component
      :is="keyListType"
      :config="config"
      :client="client"
      :keyList="keyList">
    </component>

    <!-- load more -->
    <el-button
      ref='scanMoreBtn'
      class='load-more-keys'
      :disabled='scanMoreDisabled'
      @click='refreshKeyList(false)'>
      {{ $t('message.load_more_keys') }}
    </el-button>
  </div>
</template>

<script type="text/javascript">
import KeyListTree from '@/components/KeyListTree';
import KeyListNormal from '@/components/KeyListNormal';

export default {
  data() {
    return {
      keyList: [],
      keyListType: this.config.separator === '' ? 'KeyListNormal' : 'KeyListTree',
      keysPageSize: this.keyListType === 'KeyListNormal' ? 200 : 400,
      searchPageSize: 10000,
      scanStreams: [],
      scanningCount: 0,
      scanMoreDisabled: false,
      onePageList: [],
      onePageFinishedCount: 0,
      firstPageFinished: false,
    };
  },
  props: ['client', 'config'],
  components: {KeyListTree, KeyListNormal},
  created() {
    // add or remove key from key list directly
    this.$bus.$on('refreshKeyList', (client, key = '', type = 'del') => {
      // refresh only self connection key list
      if ((client !== this.client) || !key) {
        return;
      }

      (type == 'del') && this.removeKeyFromKeyList(key);
      (type == 'add') && this.keyList.push(key);
    });
  },
  methods: {
    initShow() {
      this.refreshKeyList();
    },
    refreshKeyList(resetKeyList = true) {
      // reset previous list, not append mode
      resetKeyList && this.resetKeyList();

      // extract search
      if (this.$parent.$parent.$parent.$refs.operateItem.searchExact === true) {
        return this.refreshKeyListExact();
      }

      // search loading
      this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-loading';

      // init scanStream
      if (!this.scanStreams.length) {
        this.initScanStreamsAndScan();
      }

      // scan more, resume previous scanStream
      else {
        // reset one page scan param
        this.onePageList = [];
        this.onePageFinishedCount = 0;

        for (var stream of this.scanStreams) {
          stream.resume();
        }
      }
    },
    initScanStreamsAndScan() {
      // this.client.nodes: cluster
      let nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
      this.scanningCount = nodes.length;

      nodes.map(node => {
        let scanOption = {
          match: this.getMatchMode(),
          count: this.keysPageSize,
        }

        // scan count is bigger when in search mode
        scanOption.match != '*' && (scanOption.count = this.searchPageSize);

        let stream = node.scanBufferStream(scanOption);
        this.scanStreams.push(stream);

        stream.on('data', keys => {
          this.onePageList = this.onePageList.concat(keys);

          // scan once reaches page size
          if (this.onePageList.length >= this.keysPageSize) {
            // temp stop
            stream.pause();
            // search input icon recover
            this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';

            // last node refresh keylist
            if (++this.onePageFinishedCount >= this.scanningCount) {
              // clear key list only after data scaned, to prevent list jitter
              if (!this.firstPageFinished) {
                this.firstPageFinished = true;
                this.keyList = [];
              }

              // this page key list append to raw key list
              this.keyList = this.keyList.concat(this.onePageList.sort());
            }
          }
        });

        stream.on('error', (e) => {
          this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';

          // scan command disabled, other functions may be used normally
          if (
            (e.message.includes('unknown command') && e.message.includes('scan')) ||
            e.message.includes("command 'SCAN' is not allowed")
          ) {
            this.$message.error({
              message: this.$t('message.scan_disabled'),
              duration: 1500,
            });

            return;
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
            // clear key list only after data scaned, to prevent list jitter
            if (!this.firstPageFinished) {
              this.firstPageFinished = true;
              this.keyList = [];
            }

            // this page key list append to raw key list
            this.keyList = this.keyList.concat(this.onePageList.sort());

            this.scanMoreDisabled = true;
            // search input icon recover
            this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';
          }
        });
      });
    },
    resetKeyList(clearKeys = false) {
      clearKeys && (this.keyList = []);
      this.firstPageFinished = false;
      this.scanStreams = [];
      this.onePageList = [];
      this.onePageFinishedCount = 0;
      this.scanMoreDisabled = false;
    },
    refreshKeyListExact() {
      const match = this.getMatchMode(false);

      this.client.exists(match).then((reply) => {
        this.keyList = (reply === 1) ? [Buffer.from(match)] : [];
      });

      this.scanMoreDisabled = true;
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
  },
  watch: {
    config(newConfig) {
      // separator changes
      this.keyListType = newConfig.separator === '' ? 'KeyListNormal' : 'KeyListTree';
    },
  },
}
</script>

<style type="text/css">
  .load-more-keys {
    margin: 10px auto;
    display: block;
    height: 20px;
    width: 100%;
    font-size: 75%;
    line-height: 1px;
  }
</style>
