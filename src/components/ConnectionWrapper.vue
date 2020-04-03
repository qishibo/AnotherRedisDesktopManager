<template>
<div>
  <OperateItem
    ref='operateItem'
    :client='client'>
  </OperateItem>

  <KeyList
    ref='keyList'
    :client='client'>
  </KeyList>
</div>
</template>

<script type="text/javascript">
import redisClient from '../redisClient.js';
import KeyList from '@/components/KeyList';
import OperateItem from '@/components/OperateItem';

export default {
  data() {
    return {
      client: null,
      openedStatus: false,
    };
  },
  props: ['config'],
  components: {OperateItem, KeyList},
  created() {
    this.$bus.$on('closeRedisClient', () => {
      this.client && this.client.quit && this.client.quit();
      this.client = null;
    });
    this.$bus.$on('proxyOpenCli', (connectionName) => {
      if (connectionName !== this.config.connectionName) {
        return;
      }
      // open cli before connection opened
      if (!this.client) {
        // open Connections.vue menu
        this.$parent.$parent.$parent.$refs.connectionMenu.open(connectionName);
        // open connection
        this.openConnection(() => {
          this.$bus.$emit('openCli', this.client, this.config.connectionName);
        });
      }
      else {
        this.$bus.$emit('openCli', this.client, this.config.connectionName);
      }
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
          if (!this.openedStatus) {
            this.$bus.$emit('openStatus', this.client, this.config.connectionName);
            this.openedStatus = true;
          }

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

            this.$bus.$emit('closeAllConnection');
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

          this.$bus.$emit('closeAllConnection');
        });

        return this.client = client;
      }
    },
  },
}
</script>
