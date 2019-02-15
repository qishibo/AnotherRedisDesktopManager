<template>
  <div>
    <el-menu @open="openConnection" class="connection-menu" active-text-color="#ffd04b">
      <el-submenu v-for="(item, index) of connections" :key="item.showName" :index="''+index">

        <!-- connection item -->
        <template slot="title">
          <span slot="title" :title="item.showName" class="connection-name">{{item.showName}}</span>
          <i class="el-icon-search" @click.stop.prevent=""></i>
          <i class="el-icon-edit-outline"></i>
          <i class="el-icon-delete" @click.stop.prevent="deleteConnection(item)"></i>
        </template>

        <!-- db item -->
        <el-collapse @change="changeDB">
          <el-collapse-item v-for="dbIndex of dbs" :key="dbIndex" :name="dbIndex">

            <template slot="title">
              <span class="connection-db">db{{dbIndex}}</span>
              <i class="el-icon-search" @click=""></i>
              <i class="el-icon-edit-outline"></i>
              <i class="el-icon-delete"></i>
            </template>

            <div>
              <ul class="key-list">
                <li class="key-item" v-for="key of getKeys(dbIndex)" @click="clickKey(key, dbIndex)">{{key}}</li>
              </ul>
            </div>

          </el-collapse-item>
        </el-collapse>

      </el-submenu>
    </el-menu>

  </div>

</template>

<script>
  import storage from '../storage.js';
  import redisClient from '../redisClient.js';
  import Vue from 'vue';

  export default {
    data: function () {
      return {
        dbs: [...Array(16).keys()],
        connections: [],
        keys: {}, // {db0: ['k1', 'k2']}
        connectionPool: {},
        openedStatus: {},
        openedDbs: [],
      };
    },
    created() {
      this.$bus.$on('refreshKeyList', () => {
        this.initDBKeys();
      });
    },
    methods: {
      openConnection(index) {
        // get connection config
        let connections = storage.getConnections();
        let connection = connections[index];

        if (!connection) {
          alert('open error');
          return;
        }

        let key = connection.host + connection.port + connection.name;

        if (!this.connectionPool[key]) {
          let client = redisClient.createConnection(connection.host, connection.port, connection.auth);
          this.connectionPool[key] = client;
        }

        // set global client
        this.$util.set('client', this.connectionPool[key]);
        this.$util.set('config', connection);

        // open status tab
        if (!this.openedStatus[key]) {
          this.$bus.$emit('openStatus');
          this.openedStatus[key] = true;
        }
      },
      deleteConnection(connection) {
        console.log(connection);

        this.$confirm(
          this.$t('message.confirm_to_delete_connection'),
          {type: 'warning'}
        ).then(() => {
          storage.deleteConnection(connection);
          this.initConnections();

          this.$message.success({
            message: this.$t('message.delete_success'),
            duration: 1000,
          });
        }).catch(() => {
          //
        });
      },
      initConnections() {
        let connections = storage.getConnections();

        for (var item of connections) {
          item.showName = item.name || item.host + '@' + item.port;
        }

        this.connections = connections;
      },
      getKeys(dbIndex) {
        let keys = this.keys[dbIndex] ? this.keys[dbIndex] : [];
        return keys;
      },
      changeDB(activeNames) {
        let oldDbs = this.openedDbs;
        let isClose = oldDbs.length > activeNames.length;

        let preDbIndex = oldDbs.filter(function(v){ return activeNames.indexOf(v) === -1 }).concat(activeNames.filter(function(v){ return oldDbs.indexOf(v) === -1 }))[0];

        console.log(preDbIndex, isClose ? 'close' : 'open');
        this.openedDbs = activeNames;

        if (isClose) {
          return;
        }

        let selectPromise = this.$util.get('client').selectAsync(preDbIndex);

        selectPromise.then(() => {
          this.$util.set('dbIndex', preDbIndex);
          this.initDBKeys();
        });
      },
      initDBKeys() {
        let client = this.$util.get('client');
        let dbIndex = this.$util.get('dbIndex');

        // dbIndex = dbIndex ? dbIndex : 0;

        client.scanAsync(0, 'MATCH', '*', 'COUNT', 10).then(reply => {
          console.log(reply);
          Vue.set(this.keys, dbIndex, reply[1]);
        });
      },
      clickKey(key, dbIndex) {
        console.log('clicked key ' + key, 'dbIndex ' + dbIndex);

        this.$util.get('client').selectAsync(dbIndex).then(() => {
          this.$util.set('dbIndex', dbIndex);
          this.$bus.$emit('clickedKey', key);
        });
      },
    },

    mounted() {
      this.initConnections();
    }
  }
</script>

<style type="text/css">
  body {
    /*margin-left: 0;*/
  }
  .connection-menu {
    margin-top: 10px;
  }
  .connection-menu .connection-name {
    display: inline-block;
    width: 115px;
    word-break:keep-all;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .connection-menu .connection-db {
    display: inline-block;
    margin-left: 20px;
    width: 80px;
    color: grey;
  }
  .connection-menu .el-submenu__title {
    padding-left: 0px !important;
    padding-right: 0px;
    font-size: 13px !important;
  }
  .connection-menu .el-submenu__title .el-submenu__icon-arrow {
    right: 7px;
    top: 54%;
  }
  .connection-menu .el-submenu [class^=el-icon-] {
    font-size: 13px;
    margin: 0px;
    width: auto;
    color: grey;
  }

  .connection-menu .el-submenu.is-opened {
    /*background: #ECF5FF;*/
  }

  .connection-menu .key-list {
    list-style-type: none;
    padding-left: 20px;
  }
  .connection-menu .key-list .key-item {
    white-space:nowrap;
    cursor: pointer;
    color: #3c5765;
  }
  .connection-menu .key-list .key-item:hover {
    color: #409EFF;
  }
</style>
