<template>
  <el-menu
    ref="connectionMenu"
    @open="openConnection()"
    class="connection-menu"
    active-text-color="#ffd04b">
    <el-submenu :index="config.connectionName">
      <!-- connection menu -->
      <ConnectionMenu
        slot="title"
        :config="config"
        :client='client'
        @refreshConnection='openConnection()'>
      </ConnectionMenu>

      <!-- db search operate -->
      <OperateItem
        ref='operateItem'
        :client='client'>
      </OperateItem>

      <!-- key list -->
      <KeyList
        ref='keyList'
        :client='client'>
      </KeyList>
    </el-submenu>
  </el-menu>
</template>

<script type="text/javascript">
import redisClient from '@/redisClient.js';
import KeyList from '@/components/KeyList';
import OperateItem from '@/components/OperateItem';
import ConnectionMenu from '@/components/ConnectionMenu';

export default {
  data() {
    return {
      client: null,
    };
  },
  props: ['config'],
  components: {ConnectionMenu, OperateItem, KeyList},
  created() {
    this.$bus.$on('closeConnection', (connectionName = false) => {
      this.closeConnection(connectionName);
    });
  },
  methods: {
    initShow() {
      this.$refs.operateItem.initShow();
      this.$refs.keyList.initShow();
    },
    openConnection(callback = false) {
      const client = this.getRedisClient(this.config);

      // ssh tunnel promise client
      if (typeof client.then === 'function') {
        client.then((realClient) => {
          this.afterOpenConnection(realClient, callback);
        });
      }

      // normal client
      else {
        this.afterOpenConnection(client, callback);
      }
    },
    afterOpenConnection(client, callback = false) {
      // new connection, not ready
      if (client.status != 'ready') {
        client.on('ready', () => {
          // open status tab
          this.$bus.$emit('openStatus', client, this.config.connectionName);

          this.initShow();
          callback && callback();
        });
      }

      // connection is ready
      else {
        this.initShow();
        callback && callback();
      }
    },
    closeConnection(connectionName) {
      // if connectionName is not passed, close all connections
      if (connectionName && connectionName != this.config.connectionName) {
        return;
      }

      this.$refs.connectionMenu.close(this.config.connectionName);
      this.$bus.$emit('removeAllTab', connectionName);

      this.client && this.client.quit && this.client.quit();
      this.client = null;
    },
    getRedisClient(config) {
      let client = this.client;

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

            this.$bus.$emit('closeConnection');
          });

          this.client = client;
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

          this.$bus.$emit('closeConnection');
        });

        return this.client = client;
      }
    },
  },
}
</script>

<style type="text/css">
  .connection-menu {
    margin-top: 10px;
    padding-right: 6px;
    border-right: 0;
  }
</style>
