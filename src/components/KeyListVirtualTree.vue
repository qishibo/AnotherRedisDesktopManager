<template>
  <div ref="treeWrapper" class='key-list-vtree'>
    <!-- multi operate -->
    <div class="batch-operate">
      <div class="fixed-col">
        <el-checkbox v-model='checkAllSelect' @change='toggleCheckAll' class='select-cancel-all' :title='$t("message.toggle_check_all")'></el-checkbox>
      </div>
      <div class="flex-col">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-button @click='deleteBatch' type="danger" style="width: 100%" size="mini">{{ $t('el.upload.delete') }}</el-button>
          </el-col>
          <el-col :span="12">
            <el-button @click="hideMultiSelect" type="primary" style="width: 100%" size="mini">{{ $t('el.messagebox.cancel') }}</el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- tree list -->
    <VueEasyTree
      ref="veTree"
      node-key="key"
      :show-checkbox='multiOperating'
      :height="vtreeHeight"
      :data="keyNodes"
      :props="props"
      :indent=10
      :itemSize=22
      iconClass="fa fa-chevron-right"
      :expand-on-click-node='!multiOperating'
      :check-on-click-node='multiOperating'
      :emptyText="$t('el.tree.emptyText')"
      @node-click="nodeClick"
      @node-contextmenu="rightClick"
      :default-expanded-keys="Array.from(expandedKeys)"
      :default-checked-keys="[]"
      :auto-expand-parent="false"
      @node-expand="nodeExpand"
      @node-collapse="nodeCollapse"
      @check="nodeCheck"
      @click-check="clickCheck"
      @node-keydown="nodeKeyDown"
      highlight-current
    >
      <span class="key-list-custom-node" slot-scope="{node, data}" :title="node.label">
        <i v-if="!node.isLeaf" :class="node.expanded?'fa fa-folder-open':'fa fa-folder'"></i>
        <span>{{ node.label }}</span>
        <span v-if="!node.isLeaf" class="key-list-count">({{ data.keyCount }})</span>
      </span>
    </VueEasyTree>

    <!-- right context menu -->
    <div ref='rightMenu' class="key-list-right-menu">
      <!-- folder right menu -->
      <ul v-if="!rightClickNode.isLeaf">
        <li @click='clickItem("multiple_select")'>{{ $t('message.multiple_select') }}</li>
        <li @click='clickItem("memory_analysis")'>{{ $t('message.memory_analysis') }}</li>
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
import VueEasyTree from "@qii404/vue-easy-tree";

export default {
  data() {
    return {
      rightClickNode: {},
      multiOperating: false,
      checkAllSelect: false,
      vtreeHeight: 0,
      vtreeHeightRaw: 'calc(100vh - 248px)',
      vtreeHeightMutiple: 'calc(100vh - 284px)',
      treeNodesOverflow: 20e4, // 200k
      keyNodes: [],
      props: {
        label: "name",
        children: "children",
      },
      expandedKeys: new Set(),
      checkedKeys: [],
    };
  },
  props: ['client', 'config', 'keyList'],
  components: {VueEasyTree},
  computed: {
    separator() {
      return this.config.separator === undefined ? ':' : this.config.separator;
    }
  },
  methods: {
    rightClick(event, data, node) {
      this.hideAllMenus();

      this.$refs.veTree.setCurrentKey(node.key);
      this.rightClickNode = node;

      // nextTick for dom render
      this.$nextTick(() => {
        let top = event.clientY;
        const menu = this.$refs.rightMenu;
        menu.style.display = 'block';

        // position in bottom
        if (document.body.clientHeight - top < menu.clientHeight) {
          top -= menu.clientHeight;
        }

        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${top}px`;

        document.addEventListener("click", this.hideAllMenus, {once: true});
      });
    },
    nodeClick(data, node, component, event) {
      if (this.multiOperating) {
        return;
      }

      // key clicked
      if (!data.children) {
        let newTab = false;
        event && (event.ctrlKey || event.metaKey) && (newTab = true);

        this.clickKey(Buffer.from(data.nameBuffer.data), newTab);
      }
      // folder click, do nothing
    },
    nodeExpand(data, node, component) {
      this.expandedKeys.add(data.key);
      // async sort nodes
      if (!node.customSorted) {
        node.customSorted = true;
        this.$util.sortByTreeNodes(node.childNodes);
      }
    },
    nodeCollapse(data, node, component) {
      this.expandedKeys.delete(data.key);
    },
    nodeCheck(data, state) {
      const node = this.$refs.veTree.getNode(data);
      const event = (window.event.type === 'click') ? window.event : this.clickCheckEvent;

      // handle shift to multi check
      this.multipleCheck(node, event);
    },
    clickCheck(event) {
      // add 'click' event when toggle checkbox, default only 'check' event
      this.clickCheckEvent = event;
    },
    nodeKeyDown(node, event) {
      if (!node) {
        return;
      }

      const data = node.data;
      this.$refs.veTree.setCurrentKey(node.key);

      // up & down, key node
      if (['ArrowUp', 'ArrowDown'].includes(event.key) && !data.children) {
        this.clickKey(Buffer.from(data.nameBuffer.data));
      }
    },
    showMultiSelect() {
      this.multiOperating = true;
      this.$refs.treeWrapper.classList.add('show-checkbox');
      
      // adjust vtree height
      this.vtreeHeight = this.vtreeHeightMutiple;
    },
    hideMultiSelect() {
      this.multiOperating = false;
      this.checkAllSelect = false;
      this.$refs.veTree.setCheckedAll(false);
      this.$refs.treeWrapper.classList.remove('show-checkbox');

      // recover vtree height
      this.vtreeHeight = this.vtreeHeightRaw;
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
      switch(type) {
        // copy key name
        case 'copy': {
          const clipboard = require('electron').clipboard;
          clipboard.writeText(this.rightClickNode.data.name);
          break;
        }
        // del single key["delete" in the key right menu]
        case 'delete': {
          // del batch instead of single when multi operating
          if (this.multiOperating) {
            return this.deleteBatch();
          }

          let keyBuffer = Buffer.from(this.rightClickNode.data.nameBuffer.data);

          this.client.del(keyBuffer).then((reply) => {
            if (reply == 1) {
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
          this.clickKey(Buffer.from(this.rightClickNode.data.nameBuffer.data), true);
          break;
        }
        // delete whole folder
        case 'delete_folder': {
          let rule = {pattern: [this.rightClickNode.data.fullName]};
          this.$bus.$emit('openDelBatch', this.client, this.config.connectionName, rule);
          break;
        }
        // memory analysis
        case 'memory_analysis': {
          const pattern = this.rightClickNode.data.fullName;
          this.$bus.$emit('memoryAnalysis', this.client, this.config.connectionName, pattern);
          break;
        }
      }
    },
    toggleCheckAll(checked) {
      return this.$refs.veTree.setCheckedAll(checked);
    },
    deleteBatch() {
      let rule = {key: [], pattern: []};
      let checkedNodes = this.$refs.veTree.getCheckedNodes();

      for (let node of checkedNodes) {
        // key node
        if (!node.children) {
          rule.key.push(Buffer.from(node.nameBuffer.data));
        }
      }

      this.$bus.$emit('openDelBatch', this.client, this.config.connectionName, rule);
    },
    clickKey(key, newTab = false) {
      this.$bus.$emit('clickedKey', this.client, key, newTab);
    },
    multipleCheck (node, event) {
      if (!event.shiftKey || !this.lastKey || node.key === this.lastKey) {
        this.lastKey = node.key;
        this.lastY = event.screenY;
        this.lastChecked = node.checked;
        return;
      }

      const tree = this.$refs.veTree;
      const curKey = node.key;
      const direction = (event.screenY - this.lastY) <= 0 ? 'up' : 'down';

      const topKey = direction == 'up' ? curKey : this.lastKey;
      const bottomKey = direction == 'up' ? this.lastKey : curKey;

      let bottomNode = tree.getNode(bottomKey);
      let bottomNodeParents = new Set();

      // get all bottom node parents
      while (bottomNode.parent) {
        bottomNode = bottomNode.parent;
        bottomNodeParents.add(bottomNode.key);
      }

      let start = false;
      let selectedNodes = [];

      // collect all nodes which need to be checked, from bottom to top
      for (let i = tree.dataList.length - 1; i >= 0; i--) {
        const item = tree.dataList[i];

        if (!start) {
          if (item.key === bottomKey) {
            direction === 'down' && selectedNodes.push(item);
            start = true;
          }
          
          continue;
        }

        if (item.key === topKey) {
          direction === 'up' && selectedNodes.push(item);
          break;
        }

        selectedNodes.push(item);
      }

      const checkRecursive = (node, checked = true) => {
        node.checked = checked;

        // folder node
        if (node.childNodes.length) {
          for (const item of node.childNodes) {
            checkRecursive(item, checked);
          }
        }
      }

      for (let item of selectedNodes) {
        if (bottomNodeParents.has(item.key)) {
          continue;
        }
        
        checkRecursive(item, this.lastChecked);
      }

      // reinit folder node check status
      this.$refs.veTree.store._initCheckRecursive(tree.root);
    },
  },
  watch: {
    keyList(newList) {
      let newListCopy = newList;

      // size limit
      if (newList.length > this.treeNodesOverflow) {
        // force cut
        newListCopy = newList.slice(0, this.treeNodesOverflow);
        // using nextTick to relieve msg missing caused by app stuck
        this.$nextTick(() => {
          this.$message.warning({
            message: this.$t('message.tree_node_overflow', {num: this.treeNodesOverflow}),
            duration: 6000,
          });
        });
      }

      // backup checked keys
      this.checkedKeys = this.$refs.veTree.getCheckedKeys(true);

      const keyNodes = this.separator ?
        this.$util.keysToTree(newListCopy, this.separator, this.expandedKeys, this.treeNodesOverflow) :
        this.$util.keysToList(newListCopy);

      this.keyNodes = keyNodes;

      this.$nextTick(() => {
        // sort outermost layer nodes
        this.$util.sortByTreeNodes(this.$refs.veTree.root.childNodes);
        // recheck checked nodes
        this.$refs.veTree.setCheckedLeafKeys(this.checkedKeys);

        // little keys such as extract search, expand all
        if (newListCopy.length <= 10) {
          this.$refs.veTree.setExpandAll(true);
        }
      });
    },
  },
  created() {
    this.vtreeHeight = this.vtreeHeightRaw;
  },
}
</script>

<style>
/*vtree container*/
.key-list-vtree .vue-recycle-scroller {
  width: calc(100% + 2px);
}

/*replace transform to avoid font blurry*/
.key-list-vtree .vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  will-change: auto;
}

/*vtree scrollbat style*/
/*blur status*/
.key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-thumb {
  border: 3px dashed transparent;
  background-clip: padding-box;
}
.key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-track {
  background: transparent;
}

/*focus status*/
.key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-thumb:hover {
  background: #7f7f7f;
}
.key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-track:hover {
  background: #e0e0dd;
}

/*focus status darkmode*/
.dark-mode .key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-thumb:hover {
  background: #6a838f;
}
.dark-mode .key-list-vtree .vue-recycle-scroller::-webkit-scrollbar-track:hover {
  background: #495961;
}
/*vtree scrollbat style end*/


/*node item*/
.key-list-vtree .el-tree-node {
  font-size: 14px; 
}
.key-list-vtree .el-tree-node .el-tree-node__content {
  padding-left: 3px;
  padding-right: 3px;
  margin-right: 1px;
}
/*node hover color*/
.key-list-vtree .el-tree-node > .el-tree-node__content:hover {
  background-color: #e7e7e7;
}
.dark-mode .key-list-vtree .el-tree-node > .el-tree-node__content:hover {
  background-color: #50616b;
}

/*current select node color*/
.key-list-vtree .el-tree-node.is-current > .el-tree-node__content {
  background-color: #d4d4d4;
}
.dark-mode .key-list-vtree .el-tree-node.is-current > .el-tree-node__content {
  background-color: #50616b;
}

/*inner custom node item*/
.key-list-vtree .key-list-custom-node {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  /*note the following 2 items should be same value, may not consist with itemSize*/
  height: 22px;
  line-height: 22px;
}

/*checkbox*/
.key-list-vtree .el-tree-node__content>label.el-checkbox {
  margin-right: 4px;
}

/*expand icon*/
.key-list-vtree .el-tree-node__content>.el-tree-node__expand-icon {
  padding: 0;
  font-size: 76%;
}
/*expand icon for folder*/
.key-list-vtree .el-tree-node__content>.el-tree-node__expand-icon:not(.is-leaf) {
  margin-right: 6px;
  color: #7b7b7b;
}
/*expand icon for key, inner level key, align with folder*/
.key-list-vtree .el-tree-node__content>.el-tree-node__expand-icon.is-leaf {
  margin-right: 6px;
}
/*expand icon for key, first level key, stay left*/
.key-list-vtree .el-tree-node__content>.el-tree-node__expand-icon.is-leaf.level1 {
  margin-right: -4px;
}

/*folder icon*/
.key-list-vtree .key-list-custom-node .fa {
  color: #848a90;
  font-size: 115%;
}
.dark-mode .key-list-vtree .key-list-custom-node .fa {
  color: #9ea4a9;
}

/*folder keys count*/
.key-list-vtree .key-list-count {
  color: #848a90;
  float: right;
}
.dark-mode .key-list-vtree .key-list-count {
  color: #a3a6ad;
}

/*batch operate btn container*/
.key-list-vtree .batch-operate {
  display: none;
  margin-bottom: 8px;
}
.key-list-vtree.show-checkbox .batch-operate {
  display: block;
}
/*select\cancel select all col*/
.key-list-vtree .batch-operate .fixed-col {
  float: left; 
  width: 20px; 
  line-height: 22px;
}
/*second col*/
.key-list-vtree .batch-operate .flex-col {
  margin-left: 25px;
}
/*checkbox*/
.key-list-vtree .batch-operate .select-cancel-all {
  padding: 3px;
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
