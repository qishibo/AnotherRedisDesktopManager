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

        <el-form :inline="true" class="demo-form-inline" size="mini">
          <el-form-item>
            <!-- db index select -->
            <el-select v-model="selectedDbIndex" placeholder="DB" size="mini" @change="getKeys1">
              <el-option
                v-for="index in dbs"
                :key="index"
                :label="'DB' + index"
                :value="index">
              </el-option>
            </el-select>
          </el-form-item>

          <!-- search match -->
          <el-form-item>
            <el-input v-model="searchMatch" @keyup.enter.native="getKeys1" placeholder="Enter To Search" suffix-icon="el-icon-search" size="mini"></el-input>
          </el-form-item>

        </el-form>

        <ul class="key-list">
          <li class="key-item" v-for="key of keyList" @click="clickKey1(key)">{{key}}</li>
        </ul>

        <!-- page -->
        <div class="pagenation">
          <el-button type="text" @click="pagePre" size="mini" icon="el-icon-arrow-left"></el-button>
          <input @keyup.enter="jumpToPage" class="page-jumper el-input__inner" v-model="inputPageIndex"></input>
          <el-button type="text" @click="pageNext" size="mini" icon="el-icon-arrow-right"></el-button>
        </div>



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
                <li class="key-item" v-for="key of keys[dbIndex]" @click="clickKey(key, dbIndex)">{{key}}</li>
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
        keysPageSize: 5,
        connectionPool: {},
        openedStatus: {},
        openedDbs: [],
        selectedDbIndex: 0,
        searchMatch: '',
        preCursor: 0,
        keyList: [],
        scanCursorList: [0],
        prePageCounter: 0,
        pageIndex: 1,
        inputPageIndex: 1,
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

        this.getKeys1();
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
      getKeys1() {
        let dbIndex = this.selectedDbIndex;
        let match = this.searchMatch ? this.searchMatch : '*';
        let client = this.$util.get('client');

        // this.preCursor = 0;
        let cursor = this.scanCursorList[this.pageIndex - 1];

        let selectPromise = client.selectAsync(dbIndex);

        selectPromise.then(() => {
          console.log('=======');
          client.scanAsync(cursor, 'MATCH', match, 'COUNT', this.keysPageSize).then(reply => {
            console.log(reply, dbIndex);
            this.$util.set('dbIndex', dbIndex);
            // this.preCursor = reply[0];
            this.scanCursorList.push(reply[0]);
            this.keyList = reply[1];
            // Vue.set(this.keys, dbIndex, reply[1]);
          });
        });

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

        client.scanAsync(this.preCursor, 'MATCH', '*', 'COUNT', this.keysPageSize).then(reply => {
          console.log(reply);

          this.preCursor = reply[0];
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
      clickKey1(key) {
        console.log('clicked key ' + key, 'dbIndex ' + this.selectedDbIndex);

        this.$util.set('dbIndex', this.selectedDbIndex);
        this.$bus.$emit('clickedKey', key);
        return;

        this.$util.get('client').selectAsync(dbIndex).then(() => {
          this.$bus.$emit('clickedKey', key);
        });
      },
      pagePre() {
        if (--this.pageIndex < 1) {
          this.pageIndex = 1;
        }

        let cursor = this.scanCursorList[this.pageIndex - 1];
        this.refreshKeyList(cursor, false);
      },
      pageNext() {
        this.pageIndex++;
        let cursor = this.scanCursorList[this.pageIndex - 1];
        this.refreshKeyList(cursor);
      },
      jumpToPage() {
        console.log(this.inputPageIndex);
        let cursor = this.scanCursorList[this.inputPageIndex - 1];
        let inputPageIndex = this.inputPageIndex;

        if (cursor === undefined) {
          for (var i = (this.pageIndex + 1); i <= this.inputPageIndex; i++) {
            this.pageNext();
          }
        }

        else {
          this.refreshKeyList(cursor);
        }
      },
      refreshKeyList(cursor, pushToCursorList) {
        let match = this.searchMatch ? this.searchMatch : '*';

        (pushToCursorList === undefined) && (pushToCursorList = true);

        this.$util.get('client').scanAsync(cursor, 'MATCH', match, 'COUNT', this.keysPageSize).then(reply => {
          console.log(cursor, 'scan result', reply);

          // this.preCursor = reply[0];
          pushToCursorList && this.scanCursorList.push(reply[0]);
          this.keyList = reply[1];

          console.log('pushed', this.scanCursorList);
          // Vue.set(this.keys, dbIndex, reply[1]);
        });
      },
    },

    mounted() {
      this.initConnections();
      // this.getKeys1();
    }
  };
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
    padding-left: 10px;
  }
  .connection-menu .key-list .key-item {
    white-space:nowrap;
    cursor: pointer;
    color: #3c5765;
    font-size: 82%;
    line-height: 1.6;
  }
  .connection-menu .key-list .key-item:hover {
    color: #409EFF;
  }

  .pagenation {
    margin-top: 10px;
  }
  .pagenation .page-jumper {
    width: 40px;
    height: 24px;
    padding: 5px;
    font-size: 50%;
    margin: 0 10px;
    text-align: center;
  }
</style>
