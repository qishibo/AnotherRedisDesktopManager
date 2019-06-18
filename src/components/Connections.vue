<template>
  <div>
    <el-menu ref="connectionMenu" @open="openConnection" class="connection-menu" active-text-color="#ffd04b">
      <el-submenu v-for="(item, index) of connections" :key="item.menuIndex" :index="item.menuIndex">

        <!-- connection item -->
        <template slot="title">
          <div class="connection-opt-icons">
            <i :title="$t('message.refresh_connection')" class="connection-right-icon el-icon-refresh" @click.stop.prevent="refreshConnection(item.menuIndex)"></i>
            <i :title="$t('message.edit_connection')" class="connection-right-icon el-icon-edit-outline" @click.stop.prevent="showEditConnection(item, item.menuIndex)"></i>
            <i :title="$t('message.del_connection')" class="connection-right-icon el-icon-delete" @click.stop.prevent="deleteConnection(item)"></i>
          </div>
          <div slot="title" :title="item.menuIndex" class="connection-name">{{item.menuIndex}}</div>
        </template>

        <el-form class="connection-form" size="mini">
          <el-form-item>
            <el-row :gutter="6">
              <el-col :span="12">
                <!-- db index select -->
                <el-select class="db-select" v-model="selectedDbIndex[item.menuIndex]" placeholder="DB" size="mini" @change="changeDb(item.menuIndex)" filterable default-first-option>
                  <el-option
                    v-for="index in dbs[item.menuIndex]"
                    :key="index"
                    :label="'DB' + index"
                    :value="index">
                  </el-option>
                  <!-- <span slot="prefix" class="fa fa-sitemap" style="font-size: 80%"></span> -->
                </el-select>
              </el-col>

              <el-col :span="12">
                <!-- new key btn -->
                <el-button class="new-key-btn" @click="showNewKeyDialog(item.menuIndex)">
                  <i class="el-icon-plus"></i>
                  {{ $t('message.add_new_key')}}
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>

          <!-- search match -->
          <el-form-item class="search-item">
            <el-row>
              <el-col :span="24">
                <el-input class="search-input" v-model="searchMatch[item.menuIndex]" @keyup.enter.native="changeMatchMode(item.menuIndex)" :placeholder="$t('message.enter_to_search')" size="mini">
                  <span slot="suffix" >
                    <i class="el-input__icon search-icon" :class="searchIcon"  @click="changeMatchMode(item.menuIndex)"></i>

                    <el-tooltip effect="dark" :content="$t('message.exact_search')" placement="bottom">
                      <el-checkbox v-model="searchExact[item.menuIndex]"></el-checkbox>
                    </el-tooltip>
                  </span>
                </el-input>
              </el-col>
            </el-row>

          </el-form-item>
        </el-form>

        <!-- key list -->
        <ul class="key-list">
          <RightClickMenu :items="rightMenus" :clickValue="{key: key, menuIndex: item.menuIndex}" :key="key" v-for="key of keyList[item.menuIndex]">
            <li class="key-item" :title="key"  @click="clickKey(key, item.menuIndex, false, $event)">{{key}}</li>
          </RightClickMenu>
        </ul>

        <!-- page -->
        <div class="pagenation">
          <el-button ref="pagePreButton" type="text" @click="pagePre(item.menuIndex)" :disabled="preButtonDisable(item.menuIndex)" size="mini" icon="el-icon-arrow-left"></el-button>
          <input
            :value="getPageIndex(item.menuIndex)"
            :ref="'pageIndexInput' + item.menuIndex"
            @click="$event.target.select()"
            @keyup.enter="jumpToPage(item.menuIndex, $event.target.value)"
            class="page-jumper el-input__inner"
            type="number"
            min="1"
            step="1"
          >
          </input>
          <el-button ref="pageNextButton" type="text" @click="pageNext(item.menuIndex)" :disabled="nextPageDisabled[item.menuIndex]" size="mini" icon="el-icon-arrow-right"></el-button>
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

        <el-form-item label="Name">
          <el-input v-model="afterEditData.name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="">
          <el-checkbox v-model="sshOptionsShow">SSH Tunnel</el-checkbox>
        </el-form-item>

        <el-form v-if="sshOptionsShow" v-show="sshOptionsShow" label-width="80px">
          <el-form-item label="Host">
            <el-input v-model="afterEditData.sshOptions.host" autocomplete="off" placeholder=""></el-input>
          </el-form-item>

          <el-form-item label="Port">
            <el-input v-model="afterEditData.sshOptions.port" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Username">
            <el-input v-model="afterEditData.sshOptions.username" autocomplete="off" placeholder=""></el-input>
          </el-form-item>

          <el-form-item label="Password">
            <el-input v-model="afterEditData.sshOptions.password" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editConnectionDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="editConnection">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>


    <!-- new key dialog -->
    <el-dialog :title="$t('message.add_new_key')" :visible.sync="newKeyDialog" width="320px">
      <el-form>
        <el-form-item :label="$t('message.key_type')">
          <el-select size="mini" v-model="selectedNewKeyType">
              <el-option
                v-for="(type, showType) in newKeyTypes"
                :key="type"
                :label="showType"
                :value="type">
              </el-option>
            </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="newKeyDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="addNewKey">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import Vue from 'vue';
import storage from '../storage.js';
import redisClient from '../redisClient.js';
import RightClickMenu from '@/components/RightClickMenu';

export default {
  data() {
    return {
      rightMenus: [
        {
          name: this.$t('message.open'),
          click: (clickValue, event) => {
            console.log('from callback....', clickValue);
            this.clickKey(clickValue.key, clickValue.menuIndex, false, event);
          },
        },
        {
          name: this.$t('message.open_new_tab'),
          click: (clickValue, event) => {
            console.log('from callback....', clickValue);
            this.clickKey(clickValue.key, clickValue.menuIndex, true, event);
          },
        },
      ],
      // dbs: [...Array(16).keys()],
      dbs: {},
      connections: [],
      keysPageSize: 50,
      connectionPool: {},
      openedStatus: {},
      selectedDbIndex: {},
      searchMatch: {},
      searchIcon: 'el-icon-search',
      searchPageSize: 10000,
      searchExact: {},
      keyList: [],
      scanCursorList: {},
      pageIndex: {},
      nextPageDisabled: {},
      beforeEditData: {},
      afterEditData: {},
      editConnectionDialog: false,
      newKeyDialog: false,
      selectedNewKeyType: 'string',
      newKeyTypes: {
        String: 'string', Hash: 'hash', List: 'list', Set: 'set', Zset: 'zset',
      },
      sshOptionsShow: false,
    };
  },
  components: {RightClickMenu},
  created() {
    this.$bus.$on('refreshKeyList', (key) => {
      const client = this.$util.get('client');

      if (!client) {
        return;
      }

      const menuIndex = client.options.menu_index;
      const match = this.getMatchMode(menuIndex);

      // if in search mode, do not refresh list, because it may be slow.
      if (match !== '*') {
        key && this.removeKeyFromKeyList(menuIndex, key);
        return;
      }

      this.refreshKeyList();
    });
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
    this.$bus.$on('closeConsole', () => {
      this.closeConsole();
    });
  },
  methods: {
    openConnection(menuIndex) {
      // get connection config
      const connection = this.connections[menuIndex];

      if (!connection) {
        alert('Connection Config Get Failed'); return;
      }

      this.getDbIndex(menuIndex);
      const client = this.setGlobalConnection(menuIndex, connection);

      // ssh tunnel promise client
      if (typeof client.then === 'function') {
        client.then((realClient) => {
            this.afterOpenConnection(realClient, menuIndex, connection);
        });
      }

      // normal client
      else {
        this.afterOpenConnection(client, menuIndex, connection);
      }
    },
    afterOpenConnection(client, menuIndex, connection) {
      // new connection, not ready
      if (!client.ready) {
        client.on('ready', () => {
          // open status tab
          if (!this.openedStatus[menuIndex]) {
            this.$bus.$emit('openStatus', connection.menuIndex);
            this.openedStatus[menuIndex] = true;
          }

          this.initDatabaseSelect(menuIndex);
          this.refreshKeyList();
        });
      }

      // connection is ready
      else {
        this.refreshKeyList();
      }
    },
    initDatabaseSelect(menuIndex) {
      this.$util.get('client').configAsync('get', 'databases').then((reply) => {
        console.log(reply);

        if (reply[1]) {
          this.$set(this.dbs, menuIndex, [...Array(parseInt(reply[1])).keys()]);
        }
        else {
          this.$set(this.dbs, menuIndex, [...Array(16).keys()]);
        }
      }).catch((err) => {
        // config command may be renamed
        console.log(`get config databases failed, ${err.message}`);
        this.$set(this.dbs, menuIndex, [...Array(16).keys()]);
      });
    },
    setGlobalConnection(menuIndex, connection) {
      let client = this.connectionPool[menuIndex];

      if (!client) {
        // ssh tunnel
        if (connection.sshOptions) {
          let sshPromise = redisClient.createSSHConnection(connection.sshOptions, connection.host, connection.port, connection.auth, menuIndex);

          sshPromise.then((client) => {
            client.on('error', (err) => {
              this.$message.error({
                message: 'SSH Redis Client On Error: ' + err,
                duration: 3000,
              });

              this.closeAllConnection();
            });

            this.$util.set('client', client);
            this.connectionPool[menuIndex] = client;
          });

          return sshPromise;
        }

        else {
          client = redisClient.createConnection(connection.host, connection.port, connection.auth, menuIndex);

          client.on('error', (err) => {
            this.$message.error({
              message: 'Redis Client On Error: ' + err,
              duration: 3000,
            });

            this.closeAllConnection();
          });

          this.connectionPool[menuIndex] = client;
        }
      }

      // set global client
      this.$util.set('client', client);

      return client;
    },
    refreshConnection(menuIndex) {
      let client = this.connectionPool[menuIndex];

      if (!client) {
        return;
      }

      this.setGlobalConnection(menuIndex);
      this.changeMatchMode(menuIndex);
    },
    deleteConnection(connection) {
      console.log(connection);

      this.$confirm(
        this.$t('message.confirm_to_delete_connection'),
        { type: 'warning' },
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
        { type: 'warning' },
      ).then(() => {
        this.closeAllConnection(oldConnection, menuIndex);

        this.editConnectionDialog = true;
        this.beforeEditData = oldConnection;
        this.sshOptionsShow = oldConnection.sshOptions ? true : false;

        this.afterEditData = JSON.parse(JSON.stringify(oldConnection));
        !this.afterEditData.sshOptions && (this.afterEditData.sshOptions = {port: 22});
        delete this.afterEditData.menuIndex;
      }).catch((_) => {});
    },
    editConnection() {
      console.log('edit connection', this.beforeEditData, this.afterEditData);

      let afterEditData = JSON.parse(JSON.stringify(this.afterEditData));

      if (!this.sshOptionsShow || !afterEditData.sshOptions.host) {
        delete afterEditData.sshOptions;
      }

      if (storage.editConnection(this.beforeEditData, afterEditData) !== false) {
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
      const connections = storage.getConnections(true);
      const slovedConnections = {};

      for (const item of connections) {
        item.menuIndex = this.initMenuIndex(item);
        slovedConnections[item.menuIndex] = item;
      }

      this.connections = slovedConnections;
    },
    closeAllConnection() {
      console.log('closing all...');

      for (const menuIndex in this.connections) {
        this.$refs.connectionMenu.close(menuIndex);
      }

      // close all connections in pool
      for (const link in this.connectionPool) {
        this.connectionPool[link].quit && this.connectionPool[link].quit();
      }

      this.connectionPool = {};
      this.openedStatus = {};
      this.selectedDbIndex = {};
      this.searchMatch = {};
      this.searchExact = {};
      this.scanCursorList = {};
      this.pageIndex = {};
      this.nextPageDisabled = {};

      this.$bus.$emit('removeAllTab');
    },
    initMenuIndex(connection) {
      return connection.name || `${connection.host}@${connection.port}`;
    },
    changeDb(menuIndex) {
      this.resetDb(menuIndex);

      const dbIndex = this.getDbIndex(menuIndex);

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
    clickKey(key, menuIndex, newTab = false, event = null) {
      console.log(`clicked key ${key}`, `dbIndex ${this.selectedDbIndex}`);

      // highlight clicked key
      this.hightKey(event);

      this.setGlobalConnection(menuIndex);
      this.$bus.$emit('clickedKey', key, newTab);
    },
    hightKey(event) {
      for (const ele of document.querySelectorAll('.key-select')) {
        ele.classList.remove("key-select");
      }

      if (event) {
        event.target.classList.add('key-select');
      }
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
      const cursorListLength = this.scanCursorList[menuIndex].length;

      this.$set(this.pageIndex, menuIndex, ++pageIndex);
      this.setGlobalConnection(menuIndex);

      this.refreshKeyList(pageIndex >= cursorListLength);
    },
    pageNextRecursive(menuIndex, targetPage) {
      let pageIndex = this.getPageIndex(menuIndex);
      const cursorList = this.scanCursorList[menuIndex];
      const cursorListLength = cursorList.length;

      console.log('begin jump recursive...', pageIndex, targetPage);

      // last page
      if (cursorList[cursorListLength - 1] == '0') {
        return false;
      }


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
        this.$refs[`pageIndexInput${menuIndex}`][0].value = 1;
        targetPage = 1;
      }

      const nowPage = this.getPageIndex(menuIndex);
      const cursorListLength = this.scanCursorList[menuIndex].length;

      this.setGlobalConnection(menuIndex);

      console.log('prepare to jump to', nowPage, targetPage);

      if (targetPage >= cursorListLength) {
        // to biggest page index
        this.$set(this.pageIndex, menuIndex, (cursorListLength <= 1) ? 1 : (cursorListLength - 1));
        const recursiveResult = this.pageNextRecursive(menuIndex, targetPage);

        // last page
        if (recursiveResult === false) {
          this.$refs[`pageIndexInput${menuIndex}`][0].value = this.pageIndex[menuIndex];

          this.$message.error({
            message: this.$t('message.max_page_reached'),
            duration: 2000,
          });
        }
      } else {
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
      const pageIndex = this.getPageIndex(menuIndex);
      return pageIndex <= 1;
    },
    refreshKeyListExact() {
      const client = this.$util.get('client');
      const menuIndex = client.options.menu_index;
      const match = this.getMatchMode(menuIndex, false);

      client.existsAsync(match).then((reply) => {
        console.log(match, reply);
        this.$set(this.keyList, menuIndex, (reply === 1) ? [match] : []);
      });

      this.$set(this.nextPageDisabled, menuIndex, true);
      this.$set(this.preButtonDisable, menuIndex, true);
    },
    removeKeyFromKeyList(menuIndex, key) {
      if (!menuIndex || !key || !this.keyList[menuIndex]) {
        return false;
      }

      const index = this.keyList[menuIndex].indexOf(key);

      if (index > -1) {
        this.keyList[menuIndex].splice(index, 1);
      }
    },
    changeMatchMode(menuIndex) {
      this.resetDb(menuIndex);
      this.setGlobalConnection(menuIndex);

      let promise = this.refreshKeyList();

      promise.then(() => {
        this.$message.success({
          message: this.$t('message.refresh_success'),
          duration: 1000,
        });
      });
    },
    getScanCursor(menuIndex) {
      if (this.scanCursorList[menuIndex] === undefined) {
        this.scanCursorList[menuIndex] = [0];
      }

      const pageIndex = this.getPageIndex(menuIndex);
      const cursorList = this.scanCursorList[menuIndex];

      return cursorList[pageIndex - 1];
    },
    getMatchMode(menuIndex, fillAsterisk = true) {
      if (this.searchMatch[menuIndex] === undefined) {
        this.searchMatch[menuIndex] = '';
      }

      let match = this.searchMatch[menuIndex];
      match = match || '*';

      if (fillAsterisk && !match.match(/\*/)) {
        match = (`*${match}*`);
      }

      return match;
    },
    refreshKeyList(pushToCursorList = true) {
      const client = this.$util.get('client');
      const menuIndex = client.options.menu_index;

      // extract search
      if (this.searchExact[menuIndex] === true) {
        this.refreshKeyListExact();
        return true;
      }

      const cursor = this.getScanCursor(menuIndex);
      const match = this.getMatchMode(menuIndex);
      // let promise = client.scanAsync(cursor, 'MATCH', match, 'COUNT', this.keysPageSize).then();
      const pageSize = (match === '*') ? this.keysPageSize : this.searchPageSize;

      // search loading
      this.searchIcon = 'el-icon-loading';

      const promise = this.beginScanning(cursor, match, pageSize, (reply, tmpShow = false) => {
        // refresh key list
        this.$set(this.keyList, menuIndex, reply[1] ? reply[1].sort() : []);

        if (tmpShow) {
          return true;
        }

        pushToCursorList && this.scanCursorList[menuIndex].push(reply[0]);

        if (reply[0] === '0') {
          this.$set(this.nextPageDisabled, menuIndex, true);
        } else {
          this.$set(this.nextPageDisabled, menuIndex, false);
        }


        // search input recover
        this.searchIcon = 'el-icon-search';

        console.log('new cursor list', this.scanCursorList);
      });

      return promise;
    },
    beginScanning(cursor, match, count, callback, recursive = true, minLength = null, lastList = []) {
      const client = this.$util.get('client');
      !minLength && (minLength = this.keysPageSize);

      const promise = client.scanAsync(cursor, 'MATCH', match, 'COUNT', count).then((reply) => {
        console.log(`cursor:${cursor} count: ${count} match:${match}`, 'scan result', reply);

        reply[1] = reply[1].concat(lastList);

        // key list length smaller than minLength
        if (recursive && (reply[0] !== '0') && (reply[1].length < minLength)) {
          callback && callback(reply, true);
          return this.beginScanning(reply[0], match, count, callback, recursive, minLength, reply[1]);
        }

        callback && callback(reply);
      });

      return promise;
    },
    showNewKeyDialog(menuIndex) {
      this.newKeyDialog = true;
      this.setGlobalConnection(menuIndex);
    },
    addNewKey() {
      this.$bus.$emit('addNewKey', this.selectedNewKeyType);
      this.newKeyDialog = false;
    },
    closeConsole() {
      console.log('close console...');
      const client = this.$util.get('client');

      if (!client || !client.options || !client.options.menu_index) {
        return true;
      }

      this.changeDbTo(client.options.menu_index, client.selected_db);
    },
    changeDbTo(menuIndex, dbIndex) {

      if (!menuIndex || isNaN(dbIndex)) {
        return true;
      }

      // db not change
      if (this.getDbIndex(menuIndex) == dbIndex) {
        return true;
      }

      this.$set(this.selectedDbIndex, menuIndex, parseInt(dbIndex));
      this.changeDb(menuIndex);
    },
  },
  mounted() {
    this.initConnections();
  },
};
</script>

<style type="text/css">
  body {
    /*margin-left: 0;*/
  }
  .connection-menu {
    margin-top: 10px;
    padding-right: 6px;
    border-right: 0;
  }
  .connection-menu .connection-name {
    /*margin-right: 65px;*/
    padding-right: 6px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    font-size: 103%;
  }
  .connection-menu .connection-opt-icons {
    /*width: 30px;*/
    float: right;
    margin-right: 28px;
  }
  .connection-menu .connection-right-icon {
    display: inline-block;
    font-size: 14px;
    /*font-weight: bold;*/
    padding: 3px;
    margin-right: -4px;
    transition: background 0.2s;
  }
  .connection-menu .connection-right-icon:hover {
    /*color: #85878a;*/
    background: #dcdee0;
    border-radius: 3px;
  }
  .connection-menu .db-select {
    width: 100%;
  }
  .connection-menu .new-key-btn {
    width: 100%;
  }
  .connection-menu .search-item {
    margin-top: -10px;
    margin-bottom: 15px;
  }
  .connection-menu .search-input .el-input__inner {
    padding-right: 43px;
    /*margin-top: -10px;;
    margin-bottom: 15px;*/
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

  .connection-menu .connection-form {
    /*padding-right: 8px;*/
  }

  .connection-menu .search-item .search-icon {
    font-size: 128%;
    color: #a5a8ad;
    cursor: pointer;
  }
  .connection-menu .search-item .el-checkbox__input {
    /*line-height: 28px;*/
    display: inline;
  }

  .connection-menu .key-list {
    list-style-type: none;
    padding-left: 0;
  }
  .connection-menu .key-list .key-item {
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #3c5765;
    font-size: 82%;
    line-height: 1.6;
    /*margin-right: 3px;*/
    padding-left: 6px;
  }
  .connection-menu .key-list .key-item:hover {
    color: #3c3d3e;
    background: #e7ebec;
  }
  .connection-menu .key-list .key-item.key-select {
    color: #3292f5;
    background: #e7ebec;
    box-sizing: border-box;
    border-left: 2px solid #68acf3;
    padding-left: 4px;
  }

  .pagenation {
    margin-top: 10px;
  }
  .pagenation .page-jumper {
    width: 40px;
    height: 24px;
    padding: 5px;
    font-size: 12px;
    margin: 0 10px;
    text-align: center;
  }

  .pagenation input::-webkit-outer-spin-button,
  .pagenation input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
</style>
