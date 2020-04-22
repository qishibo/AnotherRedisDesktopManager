<template>
  <div>
    <!-- key list -->
    <ul class='key-list'>
      <RightClickMenu
        :items='rightMenus'
        :clickValue='key'
        :key='key.toString()'
        v-for='key of keyList'>
        <li class='key-item' :title='key'  @click='clickKey(key, $event)'>{{$util.bufToString(key)}}</li>
      </RightClickMenu>
    </ul>

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
import RightClickMenu from '@/components/RightClickMenu';

export default {
  data() {
    return {
      keyList: [],
      keysPageSize: 200,
      searchPageSize: 10000,
      rightMenus: [
        {
          name: this.$t('message.open'),
          click: (clickValue, event) => {
            this.clickKey(clickValue, event, false);
          },
        },
        {
          name: this.$t('message.open_new_tab'),
          click: (clickValue, event) => {
            this.clickKey(clickValue, event, true);
          },
        },
      ],
      scanStreams: [],
      scanEndCount: 0,
      scanMoreDisabled: false,
      oneTimeListLength: 0,
      firstScanFinished: false,
    };
  },
  props: ['client'],
  components: {RightClickMenu},
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
    clickKey(key, event = null, newTab = false) {
      // highlight clicked key
      event && this.hightKey(event);
      event && (event.ctrlKey || event.metaKey) && (newTab = true);
      this.$bus.$emit('clickedKey', this.client, key, newTab);
    },
    hightKey(event) {
      for (const ele of document.querySelectorAll('.key-select')) {
        ele.classList.remove("key-select");
      }

      if (event) {
        event.target.classList.add('key-select');
      }
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
        // reset one scan count
        this.oneTimeListLength = 0;

        for (var stream of this.scanStreams) {
          stream.resume();
        }
      }
    },
    initScanStreamsAndScan() {
      // this.client.nodes: cluster
      let nodes = this.client.nodes ? this.client.nodes('master') : [this.client];
      this.scanEndCount = nodes.length;

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
          // clear key list only after data scaned, to prevent list jitter
          if (!this.firstScanFinished) {
            this.firstScanFinished = true;
            this.keyList = [];
          }

          this.oneTimeListLength += keys.length;
          this.keyList = this.keyList.concat(keys.sort());

          // scan once reaches page size
          if (this.oneTimeListLength >= this.keysPageSize) {
            // temp stop
            stream.pause();

            // search input icon recover
            this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';
          }
        });

        stream.on('error', (e) => {
          this.$message.error({
            message: 'Stream On Error: ' +  e.message,
            duration: 1500,
          });

          setTimeout(() => {
            this.$bus.$emit('closeConnection');
          }, 50);
        });

        stream.on('end', () => {
          // all nodes scan finished
          if (--this.scanEndCount <= 0) {
            // this.$refs.scanMoreBtn.disabled=true;
            this.scanMoreDisabled = true;
            // search input icon recover
            this.$parent.$parent.$parent.$refs.operateItem.searchIcon = 'el-icon-search';
          }
        });
      });
    },
    resetKeyList() {
      // this.keyList = [];
      this.firstScanFinished = false;
      this.scanStreams = [];
      this.oneTimeListLength = 0;
      this.scanMoreDisabled = false;
    },
    refreshKeyListExact() {
      const match = this.getMatchMode(false);

      this.client.exists(match).then((reply) => {
        this.keyList = (reply === 1) ? [match] : [];
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
}
</script>

<style type="text/css">
  .connection-menu .key-list {
    list-style-type: none;
    padding-left: 0;
  }
  .connection-menu .key-list .key-item {
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #292f31;
    font-size: 0.9em;
    line-height: 1.52;
    /*margin-right: 3px;*/
    padding-left: 6px;
  }
  .dark-mode .connection-menu .key-list .key-item {
    color: #f7f7f7;
  }
  .connection-menu .key-list .key-item:hover {
    /*color: #3c3d3e;*/
    background: #e7ebec;
  }
  .dark-mode .connection-menu .key-list .key-item:hover {
    color: #f7f7f7;
    background: #50616b;
  }
  .connection-menu .key-list .key-item.key-select {
    color: #0b7ff7;
    background: #e7ebec;
    box-sizing: border-box;
    border-left: 2px solid #68acf3;
    padding-left: 4px;
  }
  .dark-mode .connection-menu .key-list .key-item.key-select {
    color: #f7f7f7;
    background: #50616b;
  }

  .load-more-keys {
    margin: 10px auto;
    display: block;
    height: 20px;
    width: 100%;
    font-size: 75%;
    line-height: 1px;
  }
</style>
