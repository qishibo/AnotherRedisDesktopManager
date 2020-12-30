<template>
  <div>
    <!-- key list -->
    <ul class='key-list'>
      <RightClickMenu
        :items='rightMenus'
        :clickValue='key'
        :key='key.toString()'
        v-for='key of keyList'>
        <li class='key-item' :title='key'  @click='clickKey(key, $event)'>{{$util.bufToString(key)}}</li>
      </RightClickMenu>
    </ul>
  </div>
</template>

<script type="text/javascript">
import RightClickMenu from '@/components/RightClickMenu';

export default {
  data() {
    return {
      rightMenus: [
        {
          name: this.$t('message.open'),
          click: (clickValue, event) => {
            this.clickKey(clickValue, event, false);
          },
        },
        {
          name: this.$t('message.open_new_tab'),
          click: (clickValue, event) => {
            this.clickKey(clickValue, event, true);
          },
        },
      ],
    };
  },
  props: ['client', 'config', 'keyList'],
  components: {RightClickMenu},
  methods: {
    clickKey(key, event = null, newTab = false) {
      // highlight clicked key
      event && this.hightKey(event);
      event && (event.ctrlKey || event.metaKey) && (newTab = true);
      this.$bus.$emit('clickedKey', this.client, key, newTab);
    },
    hightKey(event) {
      for (const ele of document.querySelectorAll('.key-select')) {
        ele.classList.remove("key-select");
      }

      if (event) {
        event.target.classList.add('key-select');
      }
    },
  },
}
</script>

<style type="text/css">
  .connection-menu .key-list {
    list-style-type: none;
    padding-left: 0;
  }
  .connection-menu .key-list .key-item {
    height: 22px;
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #292f31;
    font-size: 0.9em;
    line-height: 1.52;
    /*margin-right: 3px;*/
    padding-left: 6px;
  }
  .dark-mode .connection-menu .key-list .key-item {
    color: #f7f7f7;
  }
  .connection-menu .key-list .key-item:hover {
    /*color: #3c3d3e;*/
    background: #e7ebec;
  }
  .dark-mode .connection-menu .key-list .key-item:hover {
    color: #f7f7f7;
    background: #50616b;
  }
  .connection-menu .key-list .key-item.key-select {
    color: #0b7ff7;
    background: #e7ebec;
    box-sizing: border-box;
    border-left: 2px solid #68acf3;
    padding-left: 4px;
  }
  .dark-mode .connection-menu .key-list .key-item.key-select {
    color: #f7f7f7;
    background: #50616b;
  }
</style>
