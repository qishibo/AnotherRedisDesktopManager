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
        @changeColor='setColor'
        @refreshConnection='openConnection(false, true)'>
      </ConnectionMenu>

      <!-- db search operate -->
      <OperateItem
        ref='operateItem'
        :config="config"
        :client='client'>
      </OperateItem>

      <!-- key list -->
      <KeyList
        ref='keyList'
        :config="config"
        :globalSettings='globalSettings'
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
      pingTimer: null,
      pingInterval: 10000, // ms
      lastSelectedDb: 0,
    };
  },
  props: ['config', 'globalSettings'],
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
    initLastSelectedDb() {
      let db = parseInt(localStorage.getItem('lastSelectedDb_' + this.config.connectionName));

      if (db > 0 && this.lastSelectedDb != db) {
        this.lastSelectedDb = db;
        this.$refs.operateItem && this.$refs.operateItem.setDb(db);
      }
    },
    openConnection(callback = false, forceOpen = false) {
      // recovery last selected db
      this.initLastSelectedDb();

      // opened, do nothing
      if (this.client) {
        return forceOpen ? this.afterOpenConnection(this.client, callback) : false;
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
          if (client.readyInited) {
            return;
          }

          client.readyInited = true;
          // open status tab
          this.$bus.$emit('openStatus', client, this.config.connectionName);
          this.startPingInterval();

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

      // clear ping interval
      clearInterval(this.pingTimer);

      // reset operateItem items
      this.$refs.operateItem && this.$refs.operateItem.resetStatus();
      // reset keyList items
      this.$refs.keyList && this.$refs.keyList.resetKeyList(true);

      this.client && this.client.quit && this.client.quit();
      this.client = null;

    },
    startPingInterval() {
      this.pingTimer = setInterval(() => {
        this.client && this.client.ping().then(reply => {}).catch(e => {
          // this.$message.error('Ping Error: ' + e.message);
        });
      }, this.pingInterval);
    },
    getRedisClient(config) {
      if (this.lastSelectedDb > 0) {
        config.db = this.lastSelectedDb;
      }

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
            customClass: 'redis-on-error-message'
          });

          this.$bus.$emit('closeConnection');
        });
      }).catch(error => {
        this.$message.error(error.message);
        this.$bus.$emit('closeConnection');
      });

      return clientPromise;
    },
    setColor(color, save = true) {
      const ulDom = this.$refs.connectionMenu.$el;
      const className = 'menu-with-custom-color';

      // save to setting
      save && this.$storage.editConnectionItem(this.config, {color: color});

      if (!color) {
        ulDom.classList.remove(className);
      }
      else {
        ulDom.classList.add(className);
        this.$el.style.setProperty("--menu-color", color);
      }
    },
  },
  mounted() {
    this.setColor(this.config.color, false);
  },
  beforeDestroy() {
    this.closeConnection(this.config.connectionName);
  },
}
</script>

<style type="text/css">
  /*menu ul*/
  .connection-menu {
    margin-top: 9px;
    padding-right: 6px;
    border-right: 0;
  }

  .connection-menu.menu-with-custom-color li.el-submenu {
    border-left: 5px solid var(--menu-color);
    border-radius: 4px 0 0 4px;
    padding-left: 3px;
  }

  /*this error shows first*/
  .redis-on-error-message {
    z-index:9999 !important;
  }
</style>
