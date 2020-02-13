<template>
  <div>
    <el-menu ref="connectionMenu" @open="openConnection" class="connection-menu" active-text-color="#ffd04b">
      <el-submenu v-for="(item, index) of connections" :key="item.connectionName" :index="item.connectionName">
        <!-- connection menu -->
        <ConnectionMenu
          slot="title"
          :config="item"
          @refreshConnection='openConnection(item.connectionName)'>
        </ConnectionMenu>

        <!-- db\key area -->
        <ConnectionWrapper
          :config='item'
          :ref="'connectionWrapper'+index">
        </ConnectionWrapper>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import storage from '@/storage.js';
import ConnectionMenu from '@/components/ConnectionMenu';
import ConnectionWrapper from '@/components/ConnectionWrapper';

export default {
  data() {
    return {
      connections: [],
    };
  },
  components: {ConnectionMenu, ConnectionWrapper},
  created() {
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
    this.$bus.$on('closeAllConnection', () => {
      this.closeAllConnection();
    });
  },
  methods: {
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = {};

      for (const item of connections) {
        item.connectionName = this.initConnectionName(item);
        slovedConnections[item.connectionName] = item;
      }

      this.connections = slovedConnections;
    },
    initConnectionName(connection) {
      return connection.name || `${connection.host}@${connection.port}`;
    },
    openConnection(connectionName) {
      this.$refs[`connectionWrapper${connectionName}`][0].openConnection();
    },
    closeAllConnection() {
      // close all connection menu
      for (const connectionName in this.connections) {
        this.$refs.connectionMenu.close(connectionName);
      }

      this.$bus.$emit('closeRedisClient');
      this.$bus.$emit('removeAllTab');
    },
  },
  mounted() {
    this.initConnections();
  },
};
</script>

<style type="text/css">
  body {
    /*margin-left: 0;*/
  }
  .connection-menu {
    margin-top: 10px;
    padding-right: 6px;
    border-right: 0;
  }

  /*el-sub-menu connection name style*/
  .connection-menu .el-submenu__title {
    padding-left: 0px !important;
    padding-right: 0px;
    font-size: 13px !important;
  }
</style>
