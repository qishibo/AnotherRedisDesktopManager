<template>
<div>

<!--   <div style="margin-bottom: 20px;">
    <el-button
      size="small"
      @click="addTab"
    >
      add tab
    </el-button>
  </div> -->

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
    created() {
      this.$bus.$on('clickedKey', key => {
        console.log('click key pass to tabs: ' + key);
        let client = this.util.get('client');

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

      this.$bus.$on('openStatus', () => {
        console.log('open status');
        let client = this.util.get('client');
        let config = this.util.get('config');

        let newTabName = config.host + ':' + config.port;

        this.tabs.push({
          name: newTabName,
          title: newTabName,
          component_name: 'Status',
        });

        this.selectedTabName = newTabName;
      });

      this.$bus.$on('removePreTab', () => {
        console.log('removing pre tab...');
        this.removeTab(this.selectedTabName);
      });
    },
    data() {
      return {
        selectedTabName: 'tab_name_1',
        maxTabNum: 3,
        tabs: [
          // {name: 'tab_name_1', title: 'String', content: 'tab content1111', component: 'KeyDetail', component_name: 'KeyContentString'},
          // {name: 'tab_name_2', title: 'Hash', content: 'tab content2222', component: 'KeyDetail', component_name: 'KeyContentHash'},
          // {name: 'tab_name_3', title: 'Set', content: 'tab content3333', component: 'KeyDetail', component_name: 'KeyContentSet'},
          // {name: 'tab_name_4', title: 'Zset', content: 'tab content4444', component: 'KeyDetail', component_name: 'KeyContentZset'},
          // {name: 'tab_name_5', title: 'List', content: 'tab content5555', component: 'KeyDetail', component_name: 'KeyContentList'},
          // {name: 'tab_name_6', title: 'Status', content: 'tab content6666', component: 'KeyDetail', component_name: 'Status'},
        ],
        connectionStatus: {},
      };
    },
    components: {Status, KeyDetail},
    methods: {
      addTab() {
        let newTabName = 'tab_name_' + ++this.maxTabNum;

        this.tabs.push({
          name: newTabName,
          title: 'tab' + this.maxTabNum,
          component_name: 'Status'
        });
      },
      removeTab(removeName) {
        console.log(this.selectedTabName, removeName);

        let tabs = this.tabs;
        let nextSelectTab;

        // 如果要删除当前选中的tab 需要选出下一个高亮tab
        if (this.selectedTabName == removeName) {
          tabs.forEach((tab, index) => {
            // 遍历得出当前高亮的tab index
            if (tab.name == removeName) {
              // index为当前选中切要删除的索引 高亮设置为下一个或者上一个
              nextSelectTab = tabs[index + 1] || tabs[index - 1];
            }
          })
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
  }
</script>
