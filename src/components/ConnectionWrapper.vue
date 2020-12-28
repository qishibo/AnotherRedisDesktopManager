<template>
  <el-menu
    ref="connectionMenu"
    :collapse-transition='false'
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
        :config="config"
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
      // search input loading status
      this.$refs.operateItem.searchIcon = 'el-icon-loading';

      if (this.client) {
        return this.afterOpenConnection(this.client, callback);
      }

      // create a new client
      const clientPromise = this.getRedisClient(this.config);

      clientPromise.then((realClient) => {
        this.afterOpenConnection(realClient, callback);
      }).catch(e => {});
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
      if (connectionName && (connectionName != this.config.connectionName)) {
        return;
      }

      this.$refs.connectionMenu &&
      this.$refs.connectionMenu.close(this.config.connectionName);
      this.$bus.$emit('removeAllTab', connectionName);

      // reset operateItem items
      this.$refs.operateItem && this.$refs.operateItem.resetStatus();
      // reset keyList items
      this.$refs.keyList && this.$refs.keyList.resetKeyList(true);

      this.client && this.client.quit && this.client.quit();
      this.client = null;
    },
    getRedisClient(config) {
      // ssh client
      if (config.sshOptions) {
        var clientPromise = redisClient.createSSHConnection(
          config.sshOptions, config.host, config.port, config.auth, config);
      }
      // normal client
      else {
        var clientPromise = redisClient.createConnection(
          config.host, config.port, config.auth, config);
      }

      clientPromise.then((client) => {
        this.client = client;

        client.on('error', (error) => {
          this.$message.error({
            message: 'Redis Client On Error: ' + error + ' Config right?',
            duration: 3000,
          });

          this.$bus.$emit('closeConnection');
        });
      }).catch(error => {
        this.$message.error(error.message);
        this.$bus.$emit('closeConnection');
      });

      return clientPromise;
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
