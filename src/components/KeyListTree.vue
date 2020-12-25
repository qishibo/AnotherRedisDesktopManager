<template>
  <div>
    <!-- key list -->
    <div class='key-list-ztree'>
      <div class="ztree" :id='treeId'></div>
    </div>

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
import $ from "jquery";
if (!window.jQuery) window.jQuery = $;
import ("@ztree/ztree_v3/js/jquery.ztree.core.js");

export default {
  data() {
    return {
      keyList: [],
      keysPageSize: 500,
      searchPageSize: 10000,
      scanStreams: [],
      scanningCount: 0,
      scanMoreDisabled: false,
      onePageList: [],
      onePageFinishedCount: 0,
      firstPageFinished: false,
      treeId: 'treeId' + Math.ceil(Math.random() * 1e10),
      setting: {
        view: {
          showIcon: true,
          showLine: false,
          selectedMulti: false,
          dblClickExpand: false,
          addDiyDom: this.addDiyDom,
        },
        callback: {
          onClick: (e, treeId, treeNode) => {
            if (treeNode.children) {
              this.ztreeObj && this.ztreeObj.expandNode(treeNode);
              return;
            }

            this.clickKey(Buffer.from(treeNode.nameBuffer.data), event);
          },
        },
      }
    };
  },
  props: ['client', 'config'],
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
      event && (event.ctrlKey || event.metaKey) && (newTab = true);
      this.$bus.$emit('clickedKey', this.client, key, newTab);
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
            e.message == "ERR unknown command 'scan'" ||
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
    addDiyDom(treeId, treeNode) {
      const spaceWidth = 5;
      const switchObj = $("#" + treeNode.tId + "_switch");
      const icoObj = $("#" + treeNode.tId + "_ico");
      switchObj.remove();
      icoObj.before(switchObj);

      if (treeNode.level >= 1) {
        const spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
        switchObj.before(spaceStr);
      }
    },
    treeRefresh(nodes) {
      this.ztreeObj && this.ztreeObj.destroy();
      this.ztreeObj = $.fn.zTree.init(
        $(`#${this.treeId}`),
        this.setting,
        nodes
      );
    },
  },
  watch: {
    keyList(newList) {
      const spiltChar = this.config.separator ? this.config.separator : ':';
      this.treeRefresh(this.$util.keysToTree(newList, spiltChar));
    },
  },
}
</script>

<style>
@import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css';

.ztree {
  padding: 0;
}
.ztree * {
  font-size: 14px;
  font-family: inherit;
}
.ztree li ul {
  margin: 0;
  padding: 0
}
.ztree li a {
  width: 100%;
  height: 22px;
  padding: 0;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark-mode .ztree li a {
  color: #f7f7f7;
}
.ztree li a:hover {
  text-decoration: none;
  background-color: #E7E7E7;
}
.dark-mode .ztree li a:hover {
  background: #50616b;
}
.ztree li a.curSelectedNode {
  height: 22px;
  border: 0;
  background-color: #D4D4D4;
}
.dark-mode .ztree li a.curSelectedNode {
  background: #50616b;
}

/*toggle switch*/
.ztree li span.button {font-size: 115%; background-image: none; vertical-align: middle;}
.ztree li span.button.switch {height: 22px; width: 20px; background-image: url("../assets/key_tree_toggle.png");}
.ztree li span.button.noline_open {background-position: 0 0;}
.ztree li span.button.noline_close {background-position: -18px 0;}
/*level0 toggle icon bigger*/
/*.ztree li span.button.noline_open.level0 {background-position: 0 -18px;}
.ztree li span.button.noline_close.level0 {background-position: -18px -18px;}*/


/*folder icon*/
.ztree li span.button.ico_close, .ztree li span.button.ico_open {
  margin-right: 5px;
}
/*key node remove icon*/
.ztree li span.button.ico_docu {
  display: none;
}
/*hide key node switch icon*/
.ztree li span.button.noline_docu {
  background-image: none;
}
/*keys in level0, switch icon*/
.ztree li span.button.level0.noline_docu {
  width: 10px;
}

/*folder icon*/
.ztree li span.button.ico_open::before {
  content: "\f07c";
}
.ztree li span.button.ico_close::before {
  content: "\f07b";
}
.ztree li span.button::before {
  display: inline-block;
  padding-top: 10px;
  padding-left: 2px;
  font-family: FontAwesome;
  color: #848a90;
}
.dark-mode .ztree li span.button::before {
  color: #9ea4a9;
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
