<template>
  <div>
    <el-menu @open="openConnection" class="connection-menu" active-text-color="#ffd04b" :default-active="activeIndex">
      <el-submenu v-for="(item, index) of connections" :key="item.name || item.host + '@' + item.port" :index="''+index">

        <template slot="title">
          <span slot="title" :title="item.name || item.host + '@' + item.port" class="connection-name">{{item.name || item.host + '@' + item.port}}</span>
          <i class="el-icon-search" @click.stop.prevent=""></i>
          <i class="el-icon-edit-outline"></i>
          <i class="el-icon-delete" @click.stop.prevent="deleteConnection(item)"></i>
        </template>

        <el-collapse @change="changeDB">
          <el-collapse-item v-for="dbIndex of dbs" :key="'db_'+dbIndex" :name="dbIndex">
            <template slot="title">
              <span class="connection-db">db{{dbIndex}}</span>
              <i class="el-icon-search" @click=""></i>
              <i class="el-icon-edit-outline"></i>
              <i class="el-icon-delete"></i>
            </template>
            <div>
              <ul class="key-list">
                <!-- <li class="key-item" v-for="key of keys.db0"><i class="fa fa-fighter-jet"></i> {{key}}</li> -->
                <li class="key-item" v-for="key of getKeys(dbIndex)" @click="clickKey(key)">{{key}}</li>
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
    name: "Connections",

    data: function () {
      return {
        activeIndex: '1',
        dbs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        connections: [],
        filterShow: false,
        // keys: {db0: ['k1', 'k2']},
        keys: {},
        preConnection: {},
        establishedConnection: {},
        openedStatus: {},
      };
    },
    methods: {
      openConnection(index) {
        let connections = storage.getConnections();
        let connection = connections[index];

        if (!connection) {
          alert('open error');
          return;
        }

        this.preConnection.config = connection;
        let key = connection.host + connection.port;

        if (!this.establishedConnection[key]) {
          let client = redisClient.createConnection(connection.host, connection.port, connection.auth);
          this.establishedConnection[key] = client;
        }

        this.preConnection.client = this.establishedConnection[key];
        // set global client
        this.util.set('client', this.establishedConnection[key]);
        this.util.set('config', connection);

        if (!this.openedStatus[key]) {
          this.$bus.$emit('openStatus');
          this.openedStatus[key] = true;
        }

      },
      deleteConnection(connection) {
        console.log(connection);
        storage.deleteConnection(connection);

        this.initConnections();
      },
      initConnections() {
        let connections = storage.getConnections();
        this.connections = connections;
      },
      getKeys(dbIndex) {
        let keys = this.keys[dbIndex] ? this.keys[dbIndex] : [];
        return keys;
      },
      changeDB(activeNames) {
        console.log('opened', activeNames);

        let oldDbs = this.preConnection.openedDbs ? this.preConnection.openedDbs : [];
        let isClose = oldDbs.length > activeNames.length;
        let preDbIndex = oldDbs.filter(function(v){ return activeNames.indexOf(v) === -1 }).concat(activeNames.filter(function(v){ return oldDbs.indexOf(v) === -1 }))[0];

        console.log(preDbIndex, isClose ? 'close' : 'open');
        this.preConnection.openedDbs = activeNames;

        if (isClose) {
          return;
        }

        let client = this.preConnection.client;
        client.select(preDbIndex);

        // set global client
        this.util.set('client', client);

        this.initDBKeys(client, preDbIndex);
      },
      initDBKeys(client, preDbIndex) {

        client.scanAsync(0, 'MATCH', '*', 'COUNT', 10).then(reply => {
          console.log(reply);
          Vue.set(this.keys, preDbIndex, reply[1]);
        });
      },
      clickKey(key) {
        console.log('clicked key ' + key);
        this.$bus.$emit('clickedKey', key);
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
