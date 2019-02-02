<template>
<div>

  <el-tabs v-model="selectedTabName" type="card" closable @tab-remove="removeTab">
    <el-tab-pane
      v-for="(item, index) in tabs"
      :key="item.title"
      :label="item.title"
      :name="item.name"
    >
      <Status v-if="item.component_name === 'Status'"></Status>
      <KeyDetail v-else :redisKey="item.redisKey" :keyType="item.keyType" :component="item.component_name"></KeyDetail>
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
    components: {Status, KeyDetail},
    created() {
      // key clicked
      this.$bus.$on('clickedKey', (key, dbIndex) => {
        console.log('click key pass to tabs: ' + key);

        let client = this.$util.get('client');
        let selectPromise = client.selectAsync(dbIndex);

        selectPromise.then(() => {
          client.typeAsync(key).then(type => {
            if (type === 'none') {
              this.$message.error({
                message: key + ' ' + this.$t('message.key_not_exists'),
                duration: 1000,
              });
              return;
            }
            this.switchType(key, type);
          });
        });
      });

      // open status tab
      this.$bus.$on('openStatus', () => {
        console.log('open status');

        let config = this.$util.get('config');
        let newTabName = config.host + ':' + config.port;

        this.tabs.push({
          name: newTabName,
          title: newTabName,
          component_name: 'Status',
        });

        this.selectedTabName = newTabName;
      });

      // remove pre tab
      this.$bus.$on('removePreTab', () => {
        console.log('removing pre tab...');
        this.removeTab(this.selectedTabName);
      });
    },
    methods: {
      removeTab(removeName) {
        console.log(this.selectedTabName, removeName);

        let tabs = this.tabs;
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

      switchType(key, type) {
        console.log(key, type);

        let newTabName = key + ' ' + type;
        let tabs = [];

        // keep status tabs and remove other tabs
        for (var item of this.tabs) {
          if (item.component_name === 'Status') {
            tabs.push(item);
          }
        }

        let newTabItem = {name: newTabName, title: newTabName, redisKey: key, keyType: type};

        switch (type) {
          case 'string':
            newTabItem.component_name = 'KeyContentString';
            break;
          case 'hash':
            newTabItem.component_name = 'KeyContentHash';
            break;
          case 'zset':
            newTabItem.component_name = 'KeyContentZset';
            break;
          case 'set':
            newTabItem.component_name = 'KeyContentSet';
            break;
          case 'list':
            newTabItem.component_name = 'KeyContentList';
            break;
        }

        tabs.push(newTabItem);

        this.tabs = tabs;
        this.selectedTabName = newTabName;
      },
    }
  };
</script>
