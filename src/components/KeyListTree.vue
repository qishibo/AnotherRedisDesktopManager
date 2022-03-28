<template>
  <div ref="treeWrapper" class='key-list-ztree'>
    <!-- multi operate -->
    <el-row class="batch-operate" :gutter="6">
      <el-col :span="2">
        <el-checkbox v-model='checkAllSelect' @change='toggleCheckAll' class='select-cancel-all' :title='$t("message.toggle_check_all")'></el-checkbox>
      </el-col>
      <el-col :span="11">
        <el-button @click='deleteBatch' type="danger" style="width: 100%" size="mini">{{ $t('el.upload.delete') }}</el-button>
      </el-col>
      <el-col :span="11">
        <el-button @click="hideMultiSelect" type="primary" style="width: 100%" size="mini">{{ $t('el.messagebox.cancel') }}</el-button>
      </el-col>
    </el-row>

    <!-- ztree -->
    <div class="ztree" :id='treeId'></div>

    <!-- right context menu -->
    <div ref='rightMenu' class="key-list-right-menu">
      <!-- folder right menu -->
      <ul v-if="rightClickNode.isParent">
        <li @click='clickItem("multiple_select")'>{{ $t('message.multiple_select') }}</li>
        <li @click='clickItem("delete_folder")'>{{ $t('message.delete_folder') }}</li>
      </ul>
      <!-- key right menu -->
      <ul v-else>
        <li @click='clickItem("copy")'>{{ $t('message.copy') }}</li>
        <li @click='clickItem("delete")'>{{ $t('el.upload.delete') }}</li>
        <li @click='clickItem("multiple_select")'>{{ $t('message.multiple_select') }}</li>
        <li @click='clickItem("open")'>{{ $t('message.open_new_tab') }}</li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">
import $ from "jquery";
if (!window.jQuery) window.jQuery = $;

// import ("@ztree/ztree_v3/js/jquery.ztree.all.js");
import ("@qii404/ztree_v3/js/jquery.ztree.all.js");

export default {
  data() {
    return {
      treeId: 'treeId' + Math.ceil(Math.random() * 1e10),
      openStatus: {},
      rightClickNode: {},
      multiOperating: false,
      checkAllSelect: false,
      treeNodesOverflow: 20000,
      setting: {
        view: {
          showIcon: true,
          showLine: false,
          selectedMulti: false,
          dblClickExpand: false,
          // addDiyDom: this.addDiyDom,
          expandSpeed: 'fast',
        },
        check: {
            enable: true,
            // chkboxType: { "Y": "s", "N": "s" }
        },
        callback: {
          beforeCheck: (treeId, treeNode) => {
            if (!window.event.shiftKey || !this.lastTid || this.lastTid === treeNode.tId) {
              this.lastTid = treeNode.tId;
              return true;
            }
            const curLi = document.getElementById(treeNode.tId);
            const lastLi = document.getElementById(this.lastTid);

            if (!curLi || !lastLi) {
              return true;
            }

            const direction = (curLi.getBoundingClientRect().y - lastLi.getBoundingClientRect().y)
                              <= 0 ? 'up' : 'down';
            // check between bottom and top
            this.multipleCheck(direction, treeNode.tId, this.lastTid);
            this.lastTid = treeNode.tId;

            return false;
          },
          onClick: (event, treeId, treeNode) => {
            // multi operating, do not open key detail tab, just check node
            if (this.multiOperating) {
              return this.ztreeObj.checkNode(treeNode, undefined, true, true);
            }

            // folder clicked
            if (treeNode.children) {
              // toggle tree view
              return this.ztreeObj && this.ztreeObj.expandNode(treeNode, undefined, false, false, true);
            }

            // key clicked
            this.clickKey(Buffer.from(treeNode.nameBuffer.data), event);
          },
          beforeExpand: (treeId, treeNode) => {
            // after folder expand, sorting keys
            this.folderExpand(treeNode);
            this.openStatus[treeNode.fullName] = !treeNode.open;

            return true;
          },
          onCollapse: (event, treeId, treeNode) => {
            return this.openStatus[treeNode.fullName] = treeNode.open;
          },
          onRightClick: (event, treeId, treeNode) => {
            this.hideAllMenus();

            const menu = this.$refs.rightMenu;
            menu.style.left = `${event.clientX}px`;
            menu.style.top = `${event.clientY}px`;
            menu.style.display = 'block';

            this.ztreeObj.selectNode(treeNode, false, true);
            this.rightClickNode = treeNode;

            document.addEventListener("click", this.removeMenus);
          },
        },
      }
    };
  },
  props: ['client', 'config', 'keyList'],
  computed: {
    separator() {
      return this.config.separator === undefined ? ':' : this.config.separator;
    }
  },
  methods: {
    showMultiSelect() {
      this.multiOperating = true;
      this.$refs.treeWrapper.classList.add('show-checkbox');
    },
    hideMultiSelect() {
      this.multiOperating = false;
      this.checkAllSelect = false;
      this.ztreeObj.checkAllNodes(false);
      this.$refs.treeWrapper.classList.remove('show-checkbox');
    },
    removeMenus() {
      document.removeEventListener("click", this.removeMenus);
      this.hideAllMenus();
    },
    hideAllMenus() {
      let menus = document.querySelectorAll('.key-list-right-menu');

      if (menus.length === 0) {
        return;
      }

      for (const menu of menus) {
        menu.style.display='none';
      }
    },
    clickItem(type) {
      this.removeMenus();

      switch(type) {
        // copy key name
        case 'copy': {
          const clipboard = require('electron').clipboard;
          clipboard.writeText(this.rightClickNode.name);
          break;
        }
        // del single key["delete" in the key right menu]
        case 'delete': {
          // del batch instead of single when multi operating
          if (this.multiOperating) {
            return this.deleteBatch();
          }

          let keyBuffer = Buffer.from(this.rightClickNode.nameBuffer.data);

          this.client.del(keyBuffer).then((reply) => {
            if (reply === 1) {
              this.$message.success({
                message: this.$t('message.delete_success'),
                duration: 1000,
              });

              this.$bus.$emit('refreshKeyList', this.client, keyBuffer, 'del');
            }
            else {
              this.$message.error(this.$t('message.delete_failed'));
            }
          }).catch(e => {this.$message.error(e.message);});
          break;
        }
        // select multiple
        case 'multiple_select': {
          this.showMultiSelect();
          break;
        }
        // open key in new tab
        case 'open': {
          this.clickKey(Buffer.from(this.rightClickNode.nameBuffer.data), null, true);
          break;
        }
        // delete whole folder
        case 'delete_folder': {
          let rule = {pattern: [this.rightClickNode.fullName]};
          this.$bus.$emit('openDelBatch', this.client, this.config.connectionName, rule);
          break;
        }
      }
    },
    toggleCheckAll(checked) {
      this.ztreeObj.checkAllNodes(checked);
    },
    folderExpand(treeNode) {
      if (!treeNode.asyncOperated) {
        // force cut nodes
        if (treeNode.children.length > this.treeNodesOverflow) {
          treeNode.children.splice(this.treeNodesOverflow);
          this.$nextTick(() => {
            this.$message.warning({
              message: this.$t('message.tree_node_overflow', {num: this.treeNodesOverflow}),
              duration: 4000
            });
          });
        }

        // sort nodes async, only after opened
        this.$util.sortKeysAndFolder(treeNode.children);

        treeNode.asyncOperated = true;
      }
    },
    deleteBatch() {
      let rule = {key: [], pattern: []};
      let folderNodes = {};
      let checkedNodes = this.ztreeObj.getCheckedNodes();

      for (let node of checkedNodes) {
        // key node
        if (!node.isParent) {
          rule['key'].push(Buffer.from(node.nameBuffer.data));
        }
        // folder node
        else {
          const checkStatus = node.getCheckStatus();
          if (checkStatus.checked && !checkStatus.half) {
            folderNodes[node.tId] = node;
          }
        }
      }

      // all full checked folders, keep the rootest node and remove their child nodes
      let allTids = Object.keys(folderNodes);

      for (let tId in folderNodes) {
        if (allTids.includes(folderNodes[tId].parentTId)) {
          delete folderNodes[tId]
        }
      }

      rule.pattern = Object.keys(folderNodes).map(
        tId => folderNodes[tId].fullName
      );

      // #462 multi select mode just delete displayed keys,
      // instead of scanning whole folder
      rule.pattern = [];

      this.$bus.$emit('openDelBatch', this.client, this.config.connectionName, rule);
    },
    clickKey(key, event = null, newTab = false) {
      event && (event.ctrlKey || event.metaKey) && (newTab = true);
      this.$bus.$emit('clickedKey', this.client, key, newTab);
    },
    // modify ztree struct
    addDiyDom(treeId, treeNode) {
      const spaceWidth = 5;
      const tId = treeNode.tId;

      const icoObj = document.getElementById(`${tId}_ico`);
      const checkObj = document.getElementById(`${tId}_check`);
      const switchObj = document.getElementById(`${tId}_switch`);

      // folder node
      if (treeNode.isParent) {
        icoObj.before(checkObj);
        icoObj.before(switchObj);

        // key count
        const countObj = document.createElement('span');
        countObj.setAttribute('class', 'key-list-count');
        countObj.innerHTML = `(${treeNode.keyCount})`
        icoObj.after(countObj)

        // folder indent
        if (treeNode.level > 0) {
          const spaceObj = document.createElement('span');
          spaceObj.setAttribute('style', `display:inline-block;width:${spaceWidth * treeNode.level}px`);
          switchObj.before(spaceObj);
        }
      }

      // key node
      else {
        // text span
        const spanObj = document.getElementById(`${tId}_span`);
        spanObj.before(checkObj);

        // key node remove icon and switch
        icoObj.remove();
        switchObj.remove();

        // key in foleder, add indent
        if (treeNode.level > 0) {
          const spaceObj = document.createElement('span');
          spaceObj.setAttribute('style', `display:inline-block;width:${spaceWidth * (treeNode.level + 2)}px`);
          spanObj.before(spaceObj);
        }
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
    reCheckNodes(nodes = []) {
      if (!nodes || !nodes.length) {
        return;
      }

      for (let node of nodes) {
        // skip folder node
        if (node.children) {
          continue;
        }

        // node to be checked
        // const checkedNode = this.ztreeObj.getNodeByTId(node.tId);
        // if the tId changes, use this line to find previous checked node
        const checkedNode = this.ztreeObj.getNodesByParam('name', node.name)[0];
        checkedNode && this.ztreeObj.checkNode(checkedNode, true, true);
      }
    },
    multipleCheck (direction, curTid, lastTid) {
      const topId = direction == 'up' ? curTid : lastTid;
      const bottomId = direction == 'up' ? lastTid : curTid;
      // all nodes display
      const liDoms = document.querySelectorAll(`#${this.treeId} li`);
      // same as the last node check status
      const checkTarget = this.ztreeObj.getNodeByTId(lastTid).checked;

      let startCheck = false;
      let selectedIds = new Set();
      let bottomNodeParents = new Set();

      // collect all nodes which need to be checked, from bottom to top
      for (let index = liDoms.length - 1; index >= 0; index--) {
        const domId = liDoms[index].id;
        // find bottom node
        if (!startCheck) {
          (domId === bottomId) && (startCheck = true);
          continue;
        }

        // find top node, means last node
        if (domId === topId) {
          direction === 'up' && selectedIds.add(domId);
          break;
        }

        selectedIds.add(domId);
      }

      let topNode = this.ztreeObj.getNodeByTId(topId);
      let bottomNode = this.ztreeObj.getNodeByTId(bottomId);

      // check top or bottom node
      this.ztreeObj.checkNode(direction === 'down' ? bottomNode : topNode, checkTarget, true);

      // get nodeIds in tree of bottom root
      while (bottomNode.parentTId) {
        bottomNodeParents.add(bottomNode.parentTId);
        bottomNode = bottomNode.getParentNode();
      }

      // check other nodes along the way, from bottom to top
      for (let domId of selectedIds) {
        // folders in bottom tree, checked by bottom node already
        if (bottomNodeParents.has(domId)) {
          continue;
        }

        let node = this.ztreeObj.getNodeByTId(domId);

        // exclude bottom root tree nodes
        // ignore this node because its parent node also in the check list
        if (!bottomNodeParents.has(node.parentTId) && selectedIds.has(node.parentTId)) {
          continue;
        }

        node.checked !== checkTarget && this.ztreeObj.checkNode(node, checkTarget, true);
      }
    },
  },
  watch: {
    keyList(newList) {
      // backup the previous checked nodes
      let checkedNodes = [];
      this.ztreeObj && (checkedNodes = this.ztreeObj.getCheckedNodes(true));

      const keyNodes = this.separator ?
        this.$util.keysToTree(newList, this.separator, this.openStatus, this.treeNodesOverflow) :
        this.$util.keysToList(newList);

      // nodes displayed in outermost layer
      if (keyNodes.length > this.treeNodesOverflow) {
        // force cut
        keyNodes.splice(this.treeNodesOverflow);
        // using nextTick to relieve msg missing caused by app stuck
        this.$nextTick(() => {
          this.$message.warning({
            message: this.$t('message.tree_node_overflow', {num: this.treeNodesOverflow}),
            duration: 6000,
          });
        });
      }

      // sort outermost layer nodes
      this.$util.sortKeysAndFolder(keyNodes);
      this.treeRefresh(keyNodes);

      // remove animination when too many nodes
      if (newList.length > 9000) {
        this.ztreeObj && (this.ztreeObj.setting.view.expandSpeed = '');
      }

      // recheck checked nodes
      this.reCheckNodes(checkedNodes);
      // only 1 key such as extract search, expand all
      if (newList.length <= 1) {
        this.ztreeObj && this.ztreeObj.expandAll(true);
      }
    },
  },
}
</script>

<style>
@import '@qii404/ztree_v3/css/zTreeStyle/zTreeStyle.css';

/*tree style*/
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
/*overwrite ztree span margin, default is 2px*/
.ztree li span {
  margin-right: 0;
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

/*checkbox icon*/
.ztree li span.button {font-size: 115%; background-image: url("../assets/custom_tree.png"); vertical-align: middle;}
/*fix checkbox missing*/
.ztree li span.button.chk.checkbox_false_part {background-position: 0 0;}
.ztree li span.button.chk.checkbox_false_part_focus {background-position: 0 -14px;}

/*toggle switch*/
.ztree li span.button.switch {height: 22px; width: 20px; background-image: url("../assets/key_tree_toggle.png");}
.ztree li span.button.noline_open {background-position: 0 0;}
.ztree li span.button.noline_close {background-position: -18px 0;}
/*level0 toggle icon bigger*/
/*.ztree li span.button.noline_open.level0 {background-position: 0 -18px;}
.ztree li span.button.noline_close.level0 {background-position: -18px -18px;}*/


/*node text*/
.ztree li span.node_name {
  margin-left: 5px;
}


/*folder font icon*/
.ztree li span.button.ico_open {
  line-height: 4px;
  background-image: none;
}
.ztree li span.button.ico_close {
  line-height: 4px;
  background-image: none;
}
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

/*folder keys count*/
.ztree .key-list-count {
  color: #848a90;
  float: right;
  line-height: 22px;
  margin-right: 2px;
}
.dark-mode .ztree .key-list-count {
  color: #a3a6ad;
}

/*ztree checkbox*/
.key-list-ztree .ztree li span.button.chk {
  display: none;
}
.key-list-ztree.show-checkbox .ztree li span.button.chk {
  display: inline-block;
  margin-left: 3px;
}

/*batch operate btn*/
.key-list-ztree .batch-operate {
  display: none;
  margin-bottom: 8px;
}
.key-list-ztree.show-checkbox .batch-operate {
  display: block;
}

.key-list-ztree .batch-operate .select-cancel-all {
  padding: 3px 3px 3px 2px;
}

/* right menu style start */
.key-list-right-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  padding: 0px;
  z-index: 99999;
  overflow: hidden;
  border-radius: 3px;
  border: 2px solid lightgrey;
  background: #fafafa;
}
.dark-mode .key-list-right-menu {
  background: #263238;
}

.key-list-right-menu ul {
  list-style: none;
  padding: 0px;
}
.key-list-right-menu ul li:not(:last-child) {
  border-bottom: 1px solid lightgrey;
}

.key-list-right-menu ul li {
  font-size: 13.4px;
  padding: 6px 10px;
  cursor: pointer;
  color: #263238;
}
.dark-mode .key-list-right-menu ul li {
  color: #fff;
}

.key-list-right-menu ul li:hover {
  background: #e4e2e2;
}
.dark-mode .key-list-right-menu ul li:hover {
  background: #344A4E;
}
/* right menu style end */
</style>
