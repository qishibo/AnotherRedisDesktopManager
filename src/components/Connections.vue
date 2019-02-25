<template>
  <div>
    <el-menu ref="connectionMenu" @open="openConnection" class="connection-menu" active-text-color="#ffd04b">
      <el-submenu v-for="(item, index) of connections" :key="item.showName" :index="''+index">

        <!-- connection item -->
        <template slot="title">
          <span slot="title" :title="item.showName" class="connection-name">{{item.showName}}</span>
          <!-- <i class="el-icon-search" @click.stop.prevent=""></i> -->
          <i class="el-icon-edit-outline" @click.stop.prevent="showEditConnection(item, index)"></i>
          <i class="el-icon-delete" @click.stop.prevent="deleteConnection(item)"></i>
        </template>

        <el-form :inline="true" class="demo-form-inline" size="mini">
          <el-form-item>
            <!-- db index select -->
            <el-select v-model="selectedDbIndex[index]" placeholder="DB" size="mini" @change="changeDb(index)">
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
            <el-input v-model="searchMatch[index]" @keyup.enter.native="changeMatchMode(index)" placeholder="Enter To Search" suffix-icon="el-icon-search" size="mini"></el-input>
          </el-form-item>

        </el-form>

        <ul class="key-list">
          <li class="key-item" v-for="key of keyList[index]" @click="clickKey(key, index)">{{key}}</li>
        </ul>

        <!-- page -->
        <div class="pagenation">
          <el-button ref="pagePreButton" type="text" @click="pagePre(index)" :disabled="preButtonDisable(index)" size="mini" icon="el-icon-arrow-left"></el-button>
          <input 
            :value="getPageIndex(index)"
            ref="pageIndexInput"
            @click="$event.target.select()" 
            @keyup.enter="jumpToPage(index, $event.target.value)" 
            class="page-jumper el-input__inner"
            type="number"
            min="1"
            step="1"
          >
          </input>
          <el-button ref="pageNextButton" type="text" @click="pageNext(index)" :disabled="nextPageDisabled[index]" size="mini" icon="el-icon-arrow-right"></el-button>
        </div>

      </el-submenu>
    </el-menu>

    <!-- edit connection dialog -->
    <el-dialog :title="$t('message.edit_connection')" :visible.sync="editConnectionDialog">
      <el-form v-model="afterEditData" label-width="80px">
        <el-form-item label="Host">
          <el-input v-model="afterEditData.host" autocomplete="off" placeholder="127.0.0.1"></el-input>
        </el-form-item>

        <el-form-item label="Port">
          <el-input v-model="afterEditData.port" autocomplete="off" placeholder="6379"></el-input>
        </el-form-item>

        <el-form-item label="Auth">
          <el-input v-model="afterEditData.auth" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Alias Name">
          <el-input v-model="afterEditData.name" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editConnectionDialog = false">取 消</el-button>
        <el-button type="primary" @click="editConnection">确 定</el-button>
      </div>
    </el-dialog>

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
        keysPageSize: 5,
        connectionPool: {},
        openedStatus: {},
        selectedDbIndex: {},
        searchMatch: {},
        keyList: [],
        scanCursorList: {},
        pageIndex: {},
        nextPageDisabled: {},
        beforeEditData: {},
        afterEditData: {},
        editConnectionDialog: false,
      };
    },
    created() {
      this.$bus.$on('refreshKeyList', () => {
        this.refreshKeyList();
      });
    },
    methods: {
      openConnection(index) {
        // get connection config
        let connections = this.connections;
        let connection = connections[index];

        if (!connection) {
          alert('open error');
          return;
        }

        this.getDbIndex(index);
        this.setGlobalConnection(index, connection);

        // open status tab
        if (!this.openedStatus[index]) {
          this.$bus.$emit('openStatus');
          this.openedStatus[index] = true;
        }

        this.refreshKeyList();
      },
      setGlobalConnection(menuIndex, connection) {
        if (!this.connectionPool[menuIndex]) {
          let client = redisClient.createConnection(connection.host, connection.port, connection.auth, menuIndex);
          this.connectionPool[menuIndex] = client;
        }

        // set global client
        this.$util.set('client', this.connectionPool[menuIndex]);
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
      showEditConnection(oldConnection, menuIndex) {
        this.$confirm(
          this.$t('message.close_to_edit_connection'),
          {type: 'warning'}
        ).then(() => {
          this.closeAllConnection(oldConnection, menuIndex);
          // return;

          this.editConnectionDialog = true;
          this.beforeEditData = oldConnection;

          this.afterEditData = JSON.parse(JSON.stringify(oldConnection));
          delete this.afterEditData.showName;
        }).catch(_ => {});
      },
      editConnection() {
        console.log('edit connection',this.beforeEditData, this.afterEditData);

        // not changed
        if (
          this.beforeEditData.host == this.afterEditData.host &&
          this.beforeEditData.port == this.afterEditData.port &&
          this.beforeEditData.name == this.afterEditData.name &&
          this.beforeEditData.auth == this.afterEditData.auth
          ) {
          this.editConnectionDialog = false;
          return;
        }

        if (storage.editConnection(this.beforeEditData, this.afterEditData) !== false) {
          this.editConnectionDialog = false;
          this.initConnections();
          return;
        }

        this.$message.error({
          message: this.$t('message.modify_failed'),
          duration: 1000,
        });
      },
      initConnections() {
        let connections = storage.getConnections(true);

        for (var item of connections) {
          item.showName = item.name || item.host + '@' + item.port;
        }

        this.connections = connections;
      },
      closeConnection(connection, menuIndex) {
        console.log('closing...', connection , menuIndex);

        let key = this.getConnectionPoolKey(connection);
        delete this.connectionPool[key];

        this.$refs.connectionMenu.close('' + menuIndex);
      },
      closeAllConnection() {
        console.log('closing all...');

        let connections = storage.getConnections(true);

        for (var i in connections) {
          this.$refs.connectionMenu.close('' + i);
        }

        this.connectionPool = {};
        this.openedStatus = {};
        this.$bus.$emit('removeAllTab');
      },
      getConnectionPoolKey(connection) {
        return connection.host + connection.port + connection.name;
      },
      changeDb(menuIndex) {
        this.resetDb(menuIndex);

        let dbIndex = this.getDbIndex(menuIndex);

        this.setGlobalConnection(menuIndex);

        this.$util.get('client').selectAsync(dbIndex).then(() => {
          this.refreshKeyList();
        });
      },
      getDbIndex(menuIndex) {
        if (this.selectedDbIndex[menuIndex] === undefined) {
          this.selectedDbIndex[menuIndex] = 0;
        }

        return this.selectedDbIndex[menuIndex];
      },
      resetDb(menuIndex) {
        this.$set(this.pageIndex, menuIndex, 1);
        this.scanCursorList[menuIndex] = [0];
      },
      clickKey(key, menuIndex) {
        console.log('clicked key ' + key, 'dbIndex ' + this.selectedDbIndex);

        this.setGlobalConnection(menuIndex);
        this.$bus.$emit('clickedKey', key);
      },
      pagePre(menuIndex) {
        let pageIndex = this.getPageIndex(menuIndex);

        if (--pageIndex < 1) {
          pageIndex = 1;
        }

        this.$set(this.pageIndex, menuIndex, pageIndex);
        this.setGlobalConnection(menuIndex);

        this.refreshKeyList(false);
      },
      pageNext(menuIndex) {
        let pageIndex = this.getPageIndex(menuIndex);
        let cursorListLength = this.scanCursorList[menuIndex].length;

        this.$set(this.pageIndex, menuIndex, ++pageIndex);
        this.setGlobalConnection(menuIndex);

        this.refreshKeyList(pageIndex >= cursorListLength);
      },
      pageNextRecursive(menuIndex, targetPage) {
        let pageIndex = this.getPageIndex(menuIndex);
        let cursorListLength = this.scanCursorList[menuIndex].length;
        
        console.log('begin jump recursive...',pageIndex , targetPage);

        if (pageIndex < targetPage) {
          this.$set(this.pageIndex, menuIndex, ++pageIndex);

          this.refreshKeyList(pageIndex >= cursorListLength).then(() => {
            this.pageNextRecursive(menuIndex, targetPage);
          });
        }
      },
      jumpToPage(menuIndex, targetPage) {
        targetPage = parseInt(targetPage);

        if (isNaN(targetPage) || targetPage <= 0) {
          this.$refs.pageIndexInput[menuIndex].value = 1;
          targetPage = 1;
        }

        let nowPage = this.getPageIndex(menuIndex);
        let cursorListLength = this.scanCursorList[menuIndex].length;

        this.setGlobalConnection(menuIndex);
        
        console.log('prepare to jump to',nowPage , targetPage);

        if (targetPage >= cursorListLength) {
          // to biggest page index
          this.$set(this.pageIndex, menuIndex, cursorListLength - 1);
          this.pageNextRecursive(menuIndex, targetPage);
        }

        else {
          this.$set(this.pageIndex, menuIndex, targetPage);
          this.refreshKeyList(false);
        }
      },
      getPageIndex(menuIndex) {
        if (this.pageIndex[menuIndex] === undefined) {
          this.pageIndex[menuIndex] = 1;
        }

        return this.pageIndex[menuIndex];
      },
      preButtonDisable(menuIndex) {
        let pageIndex = this.getPageIndex(menuIndex);
        return pageIndex <= 1;
      },
      changeMatchMode(menuIndex) {
        this.resetDb(menuIndex);
        this.setGlobalConnection(menuIndex);
        this.refreshKeyList();
      },
      getKeyList(connection) {
        let key = this.getConnectionPoolKey(connection);

      },
      getScanCursor(menuIndex) {
        if (this.scanCursorList[menuIndex] === undefined) {
          this.scanCursorList[menuIndex] = [0];
        }

        let pageIndex = this.getPageIndex(menuIndex);
        let cursorList = this.scanCursorList[menuIndex];

        return cursorList[pageIndex - 1];
      },
      getMatchMode(menuIndex) {
        if (this.searchMatch[menuIndex] === undefined) {
          this.searchMatch[menuIndex] = '';
        }

        let match = this.searchMatch[menuIndex];
        match = match ? match : '*';

        if (!match.match(/\*/)) {
          match = ('*' + match + '*');
        }

        return match;
      },
      refreshKeyList(pushToCursorList = true) {
        let client = this.$util.get('client');
        let menuIndex = client.options.menu_index;

        let cursor = this.getScanCursor(menuIndex);
        let match = this.getMatchMode(menuIndex);

        let promise = client.scanAsync(cursor, 'MATCH', match, 'COUNT', this.keysPageSize).then(reply => {
          console.log(this.selectedDbIndex, cursor, match, 'scan result', reply);

          if (reply[0] === '0') {
            this.$set(this.nextPageDisabled, menuIndex, true);
          }

          else {
            this.$set(this.nextPageDisabled, menuIndex, false);
          }

          pushToCursorList && this.scanCursorList[menuIndex].push(reply[0]);
          this.$set(this.keyList, menuIndex, reply[1]);

          console.log('new cursor list', this.scanCursorList);
        });

        return promise;
      },
    },

    mounted() {
      this.initConnections();
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

  .pagenation input::-webkit-outer-spin-button,
  .pagenation input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
</style>
