<template>
  <div class='key-list-ztree'>
    <div class="ztree" :id='treeId'></div>
  </div>
</template>

<script type="text/javascript">
import $ from "jquery";
if (!window.jQuery) window.jQuery = $;
import ("@ztree/ztree_v3/js/jquery.ztree.core.js");

export default {
  data() {
    return {
      treeId: 'treeId' + Math.ceil(Math.random() * 1e10),
      openStatus: {},
      setting: {
        view: {
          showIcon: true,
          showLine: false,
          selectedMulti: false,
          dblClickExpand: false,
          addDiyDom: this.addDiyDom,
          expandSpeed: 'fast',
        },
        callback: {
          onClick: (event, treeId, treeNode) => {
            // folder clicked
            if (treeNode.children) {
              // toggle tree view
              this.ztreeObj && this.ztreeObj.expandNode(treeNode);

              // store open status
              let parentNode = treeNode;
              let keyPrefix  = treeNode.name;
              while (parentNode.parentTId) {
                parentNode = this.ztreeObj.getNodeByTId(parentNode.parentTId);
                keyPrefix = parentNode.name + keyPrefix;
              }
              this.openStatus[keyPrefix] = treeNode.open;

              return;
            }

            this.clickKey(Buffer.from(treeNode.nameBuffer.data), event);
          },
        },
      }
    };
  },
  props: ['client', 'config', 'keyList'],
  methods: {
    clickKey(key, event = null, newTab = false) {
      event && (event.ctrlKey || event.metaKey) && (newTab = true);
      this.$bus.$emit('clickedKey', this.client, key, newTab);
    },
    addDiyDom(treeId, treeNode) {
      const spaceWidth = 5;
      const switchObj = $("#" + treeNode.tId + "_switch");
      const icoObj = $("#" + treeNode.tId + "_ico");
      switchObj.remove();
      icoObj.before(switchObj);

      // show key count
      if (treeNode.children) {
        icoObj.after(`<span class='key-list-count'>(${treeNode.keyCount}) </span>`)
      }

      // folder indent
      if (treeNode.level >= 1) {
        const spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
        switchObj.before(spaceStr);
      }
    },
    treeRefresh(nodes) {
      // this.ztreeObj && this.ztreeObj.destroy();
      // folder keep in front
      nodes = nodes.sort(function(a, b) {
        if (a.children && b.children) {
          return 0;
        }

        return a.children ? -1 : (b.children ? 1 : 0);
      });

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
      this.treeRefresh(this.$util.keysToTree(newList, spiltChar, this.openStatus));

      // only 1 key such as extract search, expand all
      if (newList.length <= 1) {
        this.ztreeObj && this.ztreeObj.expandAll(true);
      }
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

.ztree .key-list-count {
  color: #848a90;
}
.dark-mode .ztree .key-list-count {
  color: #a3a6ad;
}
</style>
