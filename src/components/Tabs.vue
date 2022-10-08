<template>
  <div>
    <el-tabs ref="tabs" class='tabs-container' v-model="selectedTabName" type="card" closable @tab-remove="removeTab" @tab-click="tabClick">
      <el-tab-pane
        v-for="(item) in tabs"
        :key="item.name"
        :name="item.name">
        <span slot="label" :title="item.title">
          <i :class="iconNameByComponent(item.component)"></i>
          <span>{{ item.label }}</span>
        </span>

        <Status v-if="item.component === 'status'" :client='item.client' class='tab-content-wrappe' :hotKeyScope='item.name'></Status>
        <CliTab v-else-if="item.component === 'cli'" :client='item.client' class='tab-content-wrappe' :hotKeyScope='item.name'></CliTab>
        <DeleteBatch v-else-if="item.component === 'delbatch'" :client='item.client' :rule="item.rule" class='tab-content-wrappe' :hotKeyScope='item.name'></DeleteBatch>
        <MemoryAnalysis v-else-if="item.component === 'memory'" :client='item.client' :pattern="item.pattern" class='tab-content-wrappe' :hotKeyScope='item.name'></MemoryAnalysis>
        <KeyDetail v-else :client='item.client' :redisKey="item.redisKey" :keyType="item.keyType" class='tab-content-wrappe' :hotKeyScope='item.name'></KeyDetail>
      </el-tab-pane>
    </el-tabs>

    <div ref="tabContextMenu" class="tabs-context-menu">
      <ul>
        <li @click="removeTab(preTabId)">{{ $t('message.close') }}</li>
        <li @click="removeOtherTabs('other')">{{ $t('message.close_other') }}</li>
        <li @click="removeOtherTabs('right')">{{ $t('message.close_right') }}</li>
        <li @click="removeOtherTabs('left')">{{ $t('message.close_left') }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import Status from '@/components/Status';
import CliTab from '@/components/CliTab';
import KeyDetail from '@/components/KeyDetail';
import DeleteBatch from '@/components/DeleteBatch';
import MemoryAnalysis from '@/components/MemoryAnalysis';

export default {
  data() {
    return {
      selectedTabName: '',
      tabs: [],
    };
  },
  components: { Status, KeyDetail, CliTab, DeleteBatch, MemoryAnalysis },
  watch: {
    selectedTabName(value) {
      // for mousewheel toggle tabs
      value && this.$shortcut.setScope(value);
    },
  },
  created() {
    // key clicked
    this.$bus.$on('clickedKey', (client, key, newTab = false) => {
      this.addKeyTab(client, key, newTab);
    });

    // open status tab
    this.$bus.$on('openStatus', (client, tabName) => {
      this.addStatusTab(client, tabName);
    });

    // open cli tab
    this.$bus.$on('openCli', (client, tabName) => {
      this.addCliTab(client, tabName);
    });

    // open delete batch tab
    this.$bus.$on('openDelBatch', (client, tabName, rule = {}) => {
      this.addDelBatchTab(client, tabName, rule);
    });

    // open memory anaysis tab
    this.$bus.$on('memoryAnalysis', (client, tabName, pattern = '') => {
      this.addMemoryTab(client, tabName, pattern);
    });

    // remove pre tab
    this.$bus.$on('removePreTab', () => {
      this.removeTab(this.selectedTabName);
    });

    // remove all tab
    this.$bus.$on('removeAllTab', (connectionName) => {
      // close all tabs
      if (!connectionName) {
        return this.tabs = [];
      }

      this.tabs = this.tabs.filter((tab) => {
        return tab.client.options.connectionName != connectionName;
      });

      // still tabs left, solve selecting which tab
      if (this.tabs.length) {
        // previous selected left, do not change
        let filteredTab = this.tabs.filter(tab => tab.name == this.selectedTabName);
        !filteredTab.length && (this.selectedTabName = this.tabs[0].name);
      }
    });
  },
  methods: {
    removeTab(removeName) {
      if (!removeName) {
        return;
      }

      const { tabs } = this;
      let nextSelectTab;

      if (this.selectedTabName == removeName) {
        tabs.forEach((tab, index) => {
          if (tab.name == removeName) {
            nextSelectTab = tabs[index + 1] || tabs[index - 1];
          }
        });
      }

      nextSelectTab && (this.selectedTabName = nextSelectTab.name);
      this.tabs = this.tabs.filter(tab => tab.name !== removeName);

      this.$shortcut.deleteScope(removeName);
      this.$shortcut.setScope(this.selectedTabName);
    },
    tabClick(tab, event) {
      this.$shortcut.setScope(this.selectedTabName);

      if (tab.$children && tab.$children[0] && (typeof tab.$children[0].tabClick == 'function')) {
        tab.$children[0].tabClick();
      };
    },
    addStatusTab(client, tabName, newTab = true) {
      const newTabItem = {
        name: `status_${tabName}`,
        label: this.$util.cutString(tabName),
        title: tabName,
        client: client,
        component: 'status',
      }

      this.addTab(newTabItem, newTab);
    },
    addCliTab(client, tabName, newTab = true) {
      const newTabItem = {
        name: `cli_${tabName}_${Math.random()}`,
        label: this.$util.cutString(tabName),
        title: tabName,
        client: client,
        component: 'cli',
      }

      this.addTab(newTabItem, newTab);
    },
    addDelBatchTab(client, tabName, rule = {}) {
      const newTabItem = {
        name: `del_batch_${tabName}_${Math.random()}`,
        label: this.$util.cutString(tabName),
        title: tabName,
        client: client,
        component: 'delbatch',
        rule: rule,
      }

      this.addTab(newTabItem, true);
    },
    addMemoryTab(client, tabName, pattern = '') {
      const newTabItem = {
        name: `memory_analysis_${tabName}_${Math.random()}`,
        label: this.$util.cutString(tabName),
        title: tabName,
        client: client,
        component: 'memory',
        pattern: pattern,
      }

      this.addTab(newTabItem, true);
    },
    addKeyTab(client, key, newTab = false) {
      client.type(key).then((type) => {
        // key not exists
        if (type === 'none') {
          this.$message.error({
            message: `${key} ${this.$t('message.key_not_exists')}`,
            duration: 1000,
          });

          return;
        }

        this.addTab(this.initKeyTabItem(client, key, type), newTab);
      }).catch(e => {
        this.$message.error('Type Error: ' + e.message);
      });
    },
    initKeyTabItem(client, key, type) {
      const cutString = this.$util.cutString;
      const dbIndex = client.condition ? client.condition.select : 0;
      const connectionName = client.options.connectionName;
      const keyStr = this.$util.bufToString(key);

      const label = `${cutString(keyStr)} | ${cutString(connectionName)} | DB${dbIndex}`;
      const name  = `${keyStr} | ${connectionName} | DB${dbIndex}`;

      return {
        name: name, label: label, title: name, client: client, component: 'key',
        redisKey: key, keyType: type,
      };
    },
    addTab(newTabItem, newTab = false) {
      let exists = false;

      this.tabs.map((item) => {
        (item.name === newTabItem.name) && (exists = true);
      });

      // if exists, select directly
      if (exists) {
        this.selectedTabName = newTabItem.name;
        this.$shortcut.setScope(this.selectedTabName);
        return;
      }

      // new tab append to tail
      if (newTab) {
        this.tabs.push(newTabItem);
      }

      // open tab on previous selected key tab
      // or append to tail if previous tab is cli\status
      else {
        let replaced = false;

        this.tabs = this.tabs.map((item) => {
          // replace the selected tab with new tab item
          if (item.name === this.selectedTabName && item.component === 'key') {
            replaced = true;
            return newTabItem;
          }

          return item;
        });

        // pre tab is preserve tab, append to tail
        !replaced && (this.tabs.push(newTabItem));
      }

      this.selectedTabName = newTabItem.name;
      this.$shortcut.setScope(this.selectedTabName);
    },
    iconNameByComponent(component) {
      const map = {
        cli: 'fa fa-terminal',
        status: 'el-icon-info',
        delbatch: 'el-icon-delete',
        memory: 'fa fa-table',
      };

      const icon = map[component];

      return icon ? icon : 'fa fa-key';
    },
    initShortcut() {
      this.$shortcut.bind('ctrl+w, ⌘+w', () => {
        const closeWindow = !this.tabs.length;
        this.removeTab(this.selectedTabName);

        return closeWindow;
      });
    },
    bindTabEvents() {
      const tabs = this.$refs.tabs.$el.querySelector('.el-tabs__header');
      tabs && tabs.addEventListener('contextmenu', this.openContextMenu);
      tabs && tabs.addEventListener('mousewheel', this.wheelToggleTabs);
    },
    wheelToggleTabs(event) {
      let index = this.tabs.findIndex(item => item.name === this.selectedTabName);

      // up: deltaY < 0
      event.deltaY < 0 ? index-- : index++;

      if (!this.tabs[index]) {
        return;
      }

      this.selectedTabName = this.tabs[index].name;
    },
    openContextMenu(event) {
      this.preTabId = '';
      this.hideAllMenus();

      const items = this.$refs.tabs.$el.querySelectorAll('.el-tabs__header .el-tabs__item');

      if (!items.length) {
        return;
      }

      for (const item of items) {
        if (item.contains(event.srcElement)) {
          this.preTabId = item.id.substr(4); // remove prefix "tab-"
        }
      }

      if (!this.preTabId) {
        return;
      }

      // show menu
      const menu = this.$refs.tabContextMenu;
      menu.style.left = `${event.clientX}px`;
      menu.style.top = `${event.clientY}px`;
      menu.style.display = 'block';

      document.addEventListener("click", this.hideAllMenus, {once: true});
    },
    hideAllMenus() {
      let menus = document.querySelectorAll('.tabs-context-menu');

      if (menus.length === 0) {
        return;
      }

      for (const menu of menus) {
        menu.style.display='none';
      }
    },
    removeOtherTabs(type = 'right') {
      // find index of current contextMenu
      const index = this.tabs.findIndex(item => item.name === this.preTabId);

      if (index === -1) {
        return;
      }

      switch (type) {
        case 'right': {
          this.tabs = this.tabs.slice(0, index + 1);
          break;
        }
        case 'left': {
          this.tabs = this.tabs.slice(index);
          break;
        }
        case 'other': {
          this.tabs = this.tabs.filter(item => item.name === this.preTabId);
          break;
        }
      }

      // change select tab only after current select is removed
      const selectedTabExists = !!this.tabs.find(item => item.name === this.selectedTabName);
      !selectedTabExists && (this.selectedTabName = this.preTabId);
    },
  },
  mounted() {
    this.initShortcut();
    this.bindTabEvents();
  },
};
</script>

<style type="text/css">
  /*tabs header height*/
  .tabs-container .el-tabs__item {
    height: 34px;
    line-height: 34px;
  }
  .tabs-container .el-tabs__nav-next, .tabs-container .el-tabs__nav-prev {
    line-height: 34px;
  }
  /*height end*/

  .tab-content-wrappe {
    height: calc(100vh - 100px);
    overflow-x: hidden;
    overflow-y: auto;
    /*padding-left: 5px;*/
    padding-right: 8px;
    padding-bottom: 20px;
  }

  /*tabs context menu*/
  .tabs-context-menu {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    padding: 0px;
    z-index: 99999;
    border-radius: 3px;
    border: 2px solid lightgrey;
    background: #fafafa;
  }
  .dark-mode .tabs-context-menu {
    background: #263238;
  }

  .tabs-context-menu ul {
    list-style: none;
    padding: 0px;
    margin: 0;
  }
  .tabs-context-menu ul li:not(:last-child) {
    border-bottom: 1px solid lightgrey;
  }

  .tabs-context-menu ul li {
    font-size: 13.4px;
    padding: 6px 10px;
    cursor: pointer;
    color: #263238;
  }
  .dark-mode .tabs-context-menu ul li {
    color: #fff;
  }

  .tabs-context-menu ul li:hover {
    background: #e4e2e2;
  }
  .dark-mode .tabs-context-menu ul li:hover {
    background: #344A4E;
  }
  /*context menu end*/
</style>
