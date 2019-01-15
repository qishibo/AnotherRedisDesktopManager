<template>
<div>

  <div style="margin-bottom: 20px;">
    <el-button
      size="small"
      @click="addTab"
    >
      add tab
    </el-button>
  </div>

  <el-tabs v-model="selectedTabName" type="card" closable @tab-remove="removeTab">
    <el-tab-pane
      v-for="(item, index) in tabs"
      :key="item.title"
      :label="item.title"
      :name="item.name"
    >
    <keep-alive>
      <component :from="item.name" :component="item.component_name" v-bind:is="item.component"></component>
    </keep-alive>
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
        selectedTabName: 'tab_name_1',
        maxTabNum: 3,
        tabs: [
          {name: 'tab_name_1', title: 'String', content: 'tab content1111', component: 'KeyDetail', component_name: 'KeyContentString'},
          {name: 'tab_name_2', title: 'Hash', content: 'tab content2222', component: 'KeyDetail', component_name: 'KeyContentHash'},
          {name: 'tab_name_3', title: 'Set', content: 'tab content3333', component: 'KeyDetail', component_name: 'KeyContentSet'},
          {name: 'tab_name_4', title: 'Zset', content: 'tab content4444', component: 'KeyDetail', component_name: 'KeyContentZset'},
          {name: 'tab_name_5', title: 'List', content: 'tab content5555', component: 'KeyDetail', component_name: 'KeyContentList'},
        ]
      };
    },
    components: {Status, KeyDetail},
    methods: {
      addTab() {
        let newTabName = 'tab_name_' + ++this.maxTabNum;

        this.tabs.push({
          name: newTabName,
          title: 'tab' + this.maxTabNum,
          component: 'Status'
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
      }
    }
  }
</script>
