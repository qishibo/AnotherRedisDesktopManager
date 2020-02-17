<template>
  <!-- key list -->
  <ul class='key-list'>
    <RightClickMenu :items='rightMenus' :clickValue='key' :key='key' v-for='key of keyList'>
      <li class='key-item' :title='key'  @click='clickKey(key, $event)'>{{key}}</li>
    </RightClickMenu>
  </ul>
</template>

<script type="text/javascript">
import RightClickMenu from '@/components/RightClickMenu';

export default {
  data() {
    return {
      keyList: [],
      scanCursorList: [0],
      keysPageSize: 50,
      searchPageSize: 10000,
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
  props: ['client'],
  components: {RightClickMenu},
  created() {
    this.$bus.$on('refreshKeyList', (client, removeKey) => {
      // refresh only self connection key list
      if (client !== this.client) {
        return;
      }

      const match = this.getMatchMode();

      // if in search mode, do not refresh list, because it may be slow.
      if (match !== '*') {
        removeKey && this.removeKeyFromKeyList(removeKey);
        return;
      }

      this.refreshKeyList();
    });
  },
  methods: {
    initShow() {
      this.refreshKeyList();
    },
    clickKey(key, event = null, newTab = false) {
      // highlight clicked key
      event && this.hightKey(event);
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
    refreshKeyList(pushToCursorList = true) {
      const searchExact = this.$parent.$refs.operateItem.searchExact;

      // extract search
      if (searchExact === true) {
        this.refreshKeyListExact();
        return true;
      }

      const cursor = this.getScanCursor();
      const match = this.getMatchMode();
      const pageSize = (match === '*') ? this.keysPageSize : this.searchPageSize;

      // search loading
      this.$parent.$refs.operateItem.searchIcon = 'el-icon-loading';

      const promise = this.beginScanning(cursor, match, pageSize, (reply, tmpShow = false) => {
        // refresh key list
        this.keyList = reply[1] ? reply[1].sort() : [];

        if (tmpShow) {
          return true;
        }

        pushToCursorList && this.scanCursorList.push(reply[0]);
        this.$parent.$refs.pagenation.nextPageDisabled = (reply[0] === '0') ? true : false;

        // search input icon recover
        this.$parent.$refs.operateItem.searchIcon = 'el-icon-search';
      });

      return promise;
    },
    beginScanning(cursor, match, count, callback, minLength = null, lastList = []) {
      !minLength && (minLength = this.keysPageSize);

      const promise = this.client.scanAsync(cursor, 'MATCH', match, 'COUNT', count).then((reply) => {
        reply[1] = reply[1].concat(lastList);

        // key list length smaller than minLength
        if ((reply[1].length < minLength) && (reply[0] !== '0')) {
          callback && callback(reply, true);
          return this.beginScanning(reply[0], match, count, callback, minLength, reply[1]);
        }

        callback && callback(reply);
      });

      return promise;
    },
    refreshKeyListExact() {
      const match = this.getMatchMode(false);

      this.client.existsAsync(match).then((reply) => {
        this.keyList = (reply === 1) ? [match] : [];
      });

      this.$parent.$refs.pagenation.nextPageDisabled = true;
    },
    getScanCursor() {
      const pageIndex = this.getPageIndex();
      const cursorList = this.scanCursorList;

      return cursorList[pageIndex - 1];
    },
    getMatchMode(fillStar = true) {
      let match = this.$parent.$refs.operateItem.searchMatch;

      match = match || '*';

      if (fillStar && !match.match(/\*/)) {
        match = (`*${match}*`);
      }

      return match;
    },
    getPageIndex() {
      return this.$parent.$refs.pagenation.pageIndex;
    },
    removeKeyFromKeyList(key) {
      if (!key || !this.keyList) {
        return false;
      }

      const index = this.keyList.indexOf(key);

      if (index > -1) {
        this.keyList.splice(index, 1);
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
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #292f31;
    font-size: 82%;
    line-height: 1.6;
    /*margin-right: 3px;*/
    padding-left: 6px;
  }
  .connection-menu .key-list .key-item:hover {
    color: #3c3d3e;
    background: #e7ebec;
  }
  .connection-menu .key-list .key-item.key-select {
    color: #0b7ff7;
    background: #e7ebec;
    box-sizing: border-box;
    border-left: 2px solid #68acf3;
    padding-left: 4px;
  }
</style>
