<template>
  <!-- operate item -->
  <el-form class="connection-form" size="mini">
    <el-form-item>
      <el-row :gutter="6">
        <!-- db index select -->
        <el-col :span="12">
          <el-select class="db-select" v-model="selectedDbIndex" placeholder="DB" size="mini" @change="changeDb()" filterable default-first-option>
            <el-option
              v-for="index in dbs"
              :key="index"
              :label="'DB' + index"
              :value="index">
            </el-option>
            <!-- <span slot="prefix" class="fa fa-sitemap" style="font-size: 80%"></span> -->
          </el-select>
        </el-col>

        <!-- new key btn -->
        <el-col :span="12">
          <el-button class="new-key-btn" @click="newKeyDialog=true">
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
          <el-input class="search-input" v-model="searchMatch" @keyup.enter.native="changeMatchMode()" :placeholder="$t('message.enter_to_search')" size="mini">
            <span slot="suffix">
              <i class="el-input__icon search-icon" :class="searchIcon"  @click="changeMatchMode()"></i>

              <el-tooltip effect="dark" :content="$t('message.exact_search')" placement="bottom">
                <el-checkbox v-model="searchExact"></el-checkbox>
              </el-tooltip>
            </span>
          </el-input>
        </el-col>
      </el-row>
    </el-form-item>

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
  </el-form>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      dbs: [],
      selectedDbIndex: 0,
      searchMatch: '',
      searchExact: false,
      searchIcon: 'el-icon-search',
      newKeyDialog: false,
      selectedNewKeyType: 'string',
      newKeyTypes: {
        String: 'string', Hash: 'hash', List: 'list', Set: 'set', Zset: 'zset',
      },
    };
  },
  props: ['client'],
  created() {
    this.$bus.$on('changeDb', (client, dbIndex) => {
      if (client != this.client) {
        return;
      }

      this.changeDb(dbIndex);
    });
  },
  methods: {
    initShow() {
      this.initDatabaseSelect();
    },
    initDatabaseSelect() {
      this.client.configAsync('get', 'databases').then((reply) => {
        if (reply[1]) {
          this.dbs = [...Array(parseInt(reply[1])).keys()];
        }
        else {
          this.dbs =  [...Array(16).keys()];
        }
      }).catch((err) => {
        // config command may be renamed
        this.dbs =  [...Array(16).keys()];
      });
    },
    changeDb(dbIndex = false) {
      this.resetDb();

      if (dbIndex !== false) {
        this.selectedDbIndex = parseInt(dbIndex);
      }

      this.client.selectAsync(this.selectedDbIndex).then(() => {
        this.$parent.$refs.keyList.refreshKeyList();
      });
    },
    resetDb() {
      this.$parent.$refs.pagenation.pageIndex = 1;
      this.$parent.$refs.keyList.scanCursorList = [0];
    },
    addNewKey() {
      this.$bus.$emit('addNewKey', this.client, this.selectedNewKeyType);
      this.newKeyDialog = false;
    },
    changeMatchMode() {
      this.resetDb();

      let promise = this.$parent.$refs.keyList.refreshKeyList();

      promise.then && promise.then(() => {
        this.$message.success({
          message: this.$t('message.refresh_success'),
          duration: 1000,
        });
      });
    },
  },
}
</script>

<style type="text/css">
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
</style>
