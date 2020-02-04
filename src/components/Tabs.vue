<template>
<div>

  <el-tabs v-model="selectedTabName" type="card" closable @tab-remove="removeTab">
    <el-tab-pane
      v-for="(item) in tabs"
      :key="item.name"
      :label="item.title"
      :name="item.name">
      <span slot="label" :title="item.name">
        <i :class="(item.componentName === 'Status') ? 'el-icon-info' : 'fa fa-key'"></i>
        <span>{{ item.title }}</span>
      </span>
      <Status v-if="item.componentName === 'Status'"></Status>
      <KeyDetail v-else :redisKey="item.redisKey" :keyType="item.keyType"></KeyDetail>
    </el-tab-pane>
  </el-tabs>

</div>
</template>

<script>
import Status from '@/components/Status';
import KeyDetail from '@/components/KeyDetail';

export default {
  data() {
    return {
      selectedTabName: '',
      tabs: [],
    };
  },
  components: { Status, KeyDetail },
  created() {
    // key clicked
    this.$bus.$on('clickedKey', (key, newTab) => {
      this.$util.get('client').typeAsync(key).then((type) => {
        if (type === 'none') {
          this.$message.error({
            message: `${key} ${this.$t('message.key_not_exists')}`,
            duration: 1000,
          });

          return;
        }

        this.newKeyTab(key, type, newTab);
      });
    });

    // open status tab
    this.$bus.$on('openStatus', (tabName) => {
      this.tabs.push({
        name: tabName,
        title: tabName,
        componentName: 'Status',
      });

      this.selectedTabName = tabName;
    });

    // remove pre tab
    this.$bus.$on('removePreTab', () => {
      this.removeTab(this.selectedTabName);
    });

    // remove all tab
    this.$bus.$on('removeAllTab', () => {
      this.tabs = [];
    });

    // add new key tab
    this.$bus.$on('addNewKey', (type) => {
      this.newKeyTab('', type, true);
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
    },

    newKeyTab(key, type, newTab = false) {
      const cutString = this.$util.cutString;

      const client      = this.$util.get('client');
      const newShowName = `${cutString(key)} | ${cutString(client.options.menu_index)} | DB${client.selected_db ? client.selected_db : 0}`;
      const newTabName  = `${key} | ${client.options.menu_index} | DB${client.selected_db ? client.selected_db : 0}`;

      const newTabItem = {
        name: newTabName, title: newShowName, redisKey: key, keyType: type
      };

      // no tabs
      if (this.tabs.length === 0) {
        this.tabs.push(newTabItem);
        this.selectedTabName = newTabName;
        return;
      }

      let exists = false;

      this.tabs.map((item) => {
        (item.name === newTabName) && (exists = true);
      });

      // if exists, select directly
      if (exists) {
        this.selectedTabName = newTabName;
        return;
      }

      // new tab append to tail
      if (newTab) {
        this.tabs.push(newTabItem);
      }

      // else open tab on previous selected tab, exclude status tab
      else {
        let replaced = false;

        this.tabs = this.tabs.map((item) => {
          // replace the selected tab with new tab item
          if ((item.name === this.selectedTabName) && (item.componentName !== 'Status')) {
            replaced = true;
            return newTabItem;
          }

          return item;
        });

        // pre tab is status tab, append to tail
        !replaced && (this.tabs.push(newTabItem));
      }

      this.selectedTabName = newTabName;
    },
  },
};
</script>
