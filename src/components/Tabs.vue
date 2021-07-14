<template>
  <el-tabs class='tabs-container' v-model="selectedTabName" type="card" closable @tab-remove="removeTab" @tab-click="tabClick">
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
      <KeyDetail v-else :client='item.client' :redisKey="item.redisKey" :keyType="item.keyType" class='tab-content-wrappe' :hotKeyScope='item.name'></KeyDetail>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Status from '@/components/Status';
import CliTab from '@/components/CliTab';
import KeyDetail from '@/components/KeyDetail';
import DeleteBatch from '@/components/DeleteBatch';

export default {
  data() {
    return {
      selectedTabName: '',
      tabs: [],
    };
  },
  components: { Status, KeyDetail, CliTab, DeleteBatch },
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
        name: `cli_${tabName}`,
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

      const label = `${cutString(this.$util.bufToString(key))} | ${cutString(connectionName)} | DB${dbIndex}`;
      const name  = `${key} | ${connectionName} | DB${dbIndex}`;

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
  },
  mounted() {
    this.initShortcut();
  },
};
</script>

<style type="text/css">
  .tab-content-wrappe {
    height: calc(100vh - 100px);
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 7px;
    padding-bottom: 20px;
  }
</style>
