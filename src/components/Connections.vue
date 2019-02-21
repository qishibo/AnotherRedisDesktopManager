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
            <el-select v-model="selectedDbIndex" placeholder="DB" size="mini" @change="changeDb">
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
            <el-input v-model="searchMatch" @keyup.enter.native="changeMatchMode" placeholder="Enter To Search" suffix-icon="el-icon-search" size="mini"></el-input>
          </el-form-item>

        </el-form>

        <ul class="key-list">
          <li class="key-item" v-for="key of keyList" @click="clickKey(key)">{{key}}</li>
        </ul>

        <!-- page -->
        <div class="pagenation">
          <el-button ref="pagePreButton" type="text" @click="pagePre" :disabled="prePageButtonDisabled" size="mini" icon="el-icon-arrow-left"></el-button>
          <input @keyup.enter="jumpToPage($event.target.value)" class="page-jumper el-input__inner" :value="pageIndex"></input>
          <el-button ref="pageNextButton" type="text" @click="pageNext" :disabled="nextPageButtonDisabled" size="mini" icon="el-icon-arrow-right"></el-button>
        </div>

      </el-submenu>
    </el-menu>

    <!-- edit connection dialog -->
    <el-dialog :title="$t('message.new_connection')" :visible.sync="editConnectionDialog">
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
        keysPageSize: 20,
        connectionPool: {},
        openedStatus: {},
        selectedDbIndex: 0,
        searchMatch: '',
        keyList: [],
        scanCursorList: [0],
        pageIndex: 1,
        // prePageButtonDisabled: false,
        nextPageButtonDisabled: false,
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
    computed: {
      prePageButtonDisabled() {
        return this.pageIndex <= 1;
      },
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

        let key = this.getConnectionPoolKey(connection);

        if (!this.connectionPool[key]) {
          let client = redisClient.createConnection(connection.host, connection.port, connection.auth);
          this.connectionPool[key] = client;
        }

        // set global client
        this.$util.set('client', this.connectionPool[key]);

        // open status tab
        if (!this.openedStatus[key]) {
          this.$bus.$emit('openStatus');
          this.openedStatus[key] = true;
        }

        this.refreshKeyList();
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
          this.closeConnection(oldConnection, menuIndex);
          return;

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
      getConnectionPoolKey(connection) {
        return connection.host + connection.port + connection.name;
      },
      changeDb() {
        this.pageIndex = 1;
        this.scanCursorList = [0];

        let dbIndex = this.selectedDbIndex;
        let c = this.$util.get('client');
        console.log(c, c.server_info, '==--');

        this.$util.get('client').selectAsync(dbIndex).then(() => {
          this.refreshKeyList();
        });
      },
      clickKey(key) {
        console.log('clicked key ' + key, 'dbIndex ' + this.selectedDbIndex);

        this.$bus.$emit('clickedKey', key);
      },
      pagePre() {
        if (--this.pageIndex < 1) {
          this.pageIndex = 1;
        }

        this.refreshKeyList(undefined, false);
      },
      pageNext() {
        this.pageIndex++;
        this.refreshKeyList();
      },
      jumpToPage(targetPage) {
         console.log('prepare to jump to', targetPage);

        let cursor = this.scanCursorList[targetPage - 1];

        if (cursor === undefined) {
          for (var i = this.pageIndex; i < targetPage; i++) {
            this.pageNext();
          }
        }

        else {
          this.refreshKeyList(cursor, false);
        }
      },
      changeMatchMode() {
        this.pageIndex = 1;
        this.refreshKeyList();
      },
      refreshKeyList(cursor, pushToCursorList = true) {
        (cursor === undefined) && (cursor = this.scanCursorList[this.pageIndex - 1]);

        let match = this.searchMatch ? this.searchMatch : '*';

        if (!match.match(/\*/)) {
          match = ('*' + match + '*');
        }

        this.$util.get('client').scanAsync(cursor, 'MATCH', match, 'COUNT', this.keysPageSize).then(reply => {
          console.log(this.selectedDbIndex, cursor, match, 'scan result', reply);

          if (reply[0] === '0') {
            this.nextPageButtonDisabled = true;
          }

          else {
            this.nextPageButtonDisabled = false;
          }

          pushToCursorList && this.scanCursorList.push(reply[0]);
          this.keyList = reply[1];

          console.log('new cursor list', this.scanCursorList);
        });
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
</style>
