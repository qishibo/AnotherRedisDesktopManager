<template>
  <div class="connections-wrap">
    <!-- search connections input -->
    <div v-if="connections.length>=filterEnableNum" class="filter-input">
      <el-input
        v-model="filterMode"
        suffix-icon="el-icon-search"
        :placeholder="$t('message.search_connection')"
        clearable
        size="mini">
      </el-input>
    </div>

    <!-- connections list -->
    <div class="connections-list">
      <ConnectionWrapper
        v-for="item, index of filteredConnections"
        :key="item.key ? item.key : item.connectionName"
        :index="index"
        :globalSettings="globalSettings"
        :config='item'>
      </ConnectionWrapper>
    </div>

    <ScrollToTop parentNum='1' :posRight='false'></ScrollToTop>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import ConnectionWrapper from '@/components/ConnectionWrapper';
import ScrollToTop from '@/components/ScrollToTop';
import Sortable from 'sortablejs';


export default {
  data() {
    return {
      connections: [],
      globalSettings: this.$storage.getSetting(),
      filterEnableNum: 4,
      filterMode: '',
    };
  },
  components: { ConnectionWrapper, ScrollToTop },
  created() {
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
    this.$bus.$on('reloadSettings', (settings) => {
      this.globalSettings = settings;
    });
  },
  computed: {
    filteredConnections() {
      if (!this.filterMode) {
        return this.connections;
      }

      return this.connections.filter(item => {
        return item.name.toLowerCase().includes(this.filterMode.toLowerCase());
      });
    },
  },
  methods: {
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = [];
      // this.connections = [];

      for (const item of connections) {
        item.connectionName = storage.getConnectionName(item);
        // fix history bug, prevent db into config
        delete item.db;
        slovedConnections.push(item);
      }

      this.connections = slovedConnections;
    },
    sortOrder() {
      const dragWrapper = document.querySelector('.connections-list');
      Sortable.create(dragWrapper, {
        handle: '.el-submenu__title',
        animation: 400,
        direction: 'vertical',
        onEnd: (e) => {
          const { newIndex } = e;
          const { oldIndex } = e;
          // change in connections
          const currentRow = this.connections.splice(oldIndex, 1)[0];
          this.connections.splice(newIndex, 0, currentRow);
          // store
          this.$storage.reOrderAndStore(this.connections);
        },
      });
    },
  },
  mounted() {
    this.initConnections();
    this.sortOrder();
  },
};
</script>

<style type="text/css">
  .connections-wrap {
    height: calc(100vh - 59px);
    overflow-y: auto;
    margin-top: 11px;
  }
  .connections-wrap .filter-input {
    padding-right: 13px;
    margin-bottom: 4px;
  }
  /* set drag area min height, target to the end will be correct */
  .connections-wrap .connections-list {
    min-height: calc(100vh - 110px);
  }
</style>
