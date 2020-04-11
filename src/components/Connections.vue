<template>
  <div>
    <el-menu ref="connectionMenu" @open="openConnection($event)" class="connection-menu" active-text-color="#ffd04b">
      <el-submenu v-for="(item, connectionName) of connections" :key="connectionName" :index="connectionName">
        <!-- connection menu -->
        <ConnectionMenu
          slot="title"
          :config="item"
          :client='clients[connectionName]'
          @refreshConnection='openConnection(connectionName)'>
        </ConnectionMenu>

        <!-- db\key area -->
        <ConnectionWrapper
          :config='item'
          :client='clients[connectionName]'
          :ref="'connectionWrapper'+connectionName">
        </ConnectionWrapper>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import storage from '@/storage.js';
import redisClient from '../redisClient.js';
import ConnectionMenu from '@/components/ConnectionMenu';
import ConnectionWrapper from '@/components/ConnectionWrapper';

export default {
  data() {
    return {
      connections: [],
      clients: {},
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
    openConnection(connectionName, callback = false) {
      let client = this.getRedisClient(this.connections[connectionName]);

      // ssh tunnel promise client
      if (typeof client.then === 'function') {
        client.then((realClient) => {
          this.afterOpenConnection(connectionName, realClient, callback);
        });
      }

      // normal client
      else {
        this.afterOpenConnection(connectionName, client, callback);
      }
    },
    afterOpenConnection(connectionName, client, callback = false) {
      // new connection, not ready
      if (client.status != 'ready') {
        // run only once after ready
        client.on('ready', () => {
          this.$bus.$emit('openStatus', client, connectionName);
          this.$refs[`connectionWrapper${connectionName}`][0].initShow();
          callback && callback();
        });
      }

      // connection is ready
      else {
        this.$refs[`connectionWrapper${connectionName}`][0].initShow();
        callback && callback();
      }
    },
    closeAllConnection() {
      // close all connection menu
      for (let connectionName in this.connections) {
        this.$refs.connectionMenu.close(connectionName);
      }

      for (let connectionName in this.clients) {
        let client = this.clients[connectionName];
        client.quit && client.quit();
      }

      this.clients = {};
      this.$bus.$emit('removeAllTab');
    },
    getRedisClient(config) {
      let client = this.clients[config.connectionName];

      if (client) {
        return client;
      }

      // ssh tunnel
      if (config.sshOptions) {
        let sshPromise = redisClient.createSSHConnection(
          config.sshOptions, config.host, config.port, config.auth, config);

        sshPromise.then((client) => {
          client.on('error', (err) => {
            this.$message.error({
              message: 'SSH Redis Client On Error: ' + err,
              duration: 3000,
            });

            this.$bus.$emit('closeAllConnection');
          });

          this.$set(this.clients, config.connectionName, client);
        });

        return sshPromise;
      }

      // normal client
      else {
        client = redisClient.createConnection(
          config.host, config.port, config.auth, config);

        client.on('error', (err) => {
          this.$message.error({
            message: 'Redis Client On Error: ' + err,
            duration: 3000,
          });

          this.$bus.$emit('closeAllConnection');
        });

        return this.$set(this.clients, config.connectionName, client);
      }
    },
  },
  mounted() {
    this.initConnections();
  },
};
</script>

<style type="text/css">
  .connection-menu {
    margin-top: 10px;
    padding-right: 6px;
    border-right: 0;
  }
</style>
