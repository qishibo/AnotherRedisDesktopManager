<template>
  <div>
    <!-- key name -->
    <div class="key-header-item key-name-input">
      <el-input
        ref="keyNameInput"
        :value="$util.bufToString(keyName)"
        @change='changeKeyInput'
        @keyup.enter.native="renameKey"
        :title="$t('message.click_enter_to_rename')"
        placeholder="KeyName">
        <span slot="prepend" class="key-detail-type">{{ keyType }}</span>
        <i class="el-icon-check el-input__icon cursor-pointer"
          slot="suffix"
          :title="$t('message.click_enter_to_rename')"
          @click="renameKey">
        </i>
      </el-input>
    </div>

    <!-- key ttl -->
    <div class="key-header-item key-ttl-input">
      <el-input
        type="number"
        v-model="keyTTL"
        @keyup.enter.native="ttlKey"
        :title="$util.leftTime(keyTTL)">
        <span slot="prepend">TTL</span>
        <!-- remove expire -->
        <i class="el-icon-close el-input__icon cursor-pointer"
          slot="suffix"
          :title="$t('message.persist')"
          @click="persistKet">
        </i>
        <!-- save ttl -->
        <i class="el-icon-check el-input__icon cursor-pointer"
          slot="suffix"
          :title="$t('message.click_enter_to_ttl')"
          @click="ttlKey">
        </i>
      </el-input>
    </div>

    <!-- del & refresh btn -->
    <div class='key-header-item key-header-btn-con'>
      <!-- del btn -->
      <el-button ref='deleteBtn' type="danger" @click="deleteKey" icon="el-icon-delete" :title="$t('el.upload.delete')+' Ctrl+d'"></el-button>
      <!-- refresh btn -->
      <!-- <el-button ref='refreshBtn' type="success" @click="refreshKey" icon="el-icon-refresh" :title="$t('message.refresh_connection')+' Ctrl+r / F5'"></el-button> -->

      <!-- refresh btn component -->
      <el-popover
        placement="bottom"
        :open-delay="500"
        trigger="hover">
        <el-tag type="info">
          <i class="el-icon-refresh"></i>
          {{ $t('message.auto_refresh') }}
        </el-tag>

        <el-tooltip :content="$t('message.auto_refresh_tip', {interval: refreshInterval / 1000})" effect="dark" placement="bottom">
          <el-switch v-model='autoRefresh' @change="refreshInit"></el-switch>
        </el-tooltip>

        <!-- refresh btn -->
        <el-button slot="reference" ref='refreshBtn' type="success" @click="refreshKey" icon="el-icon-refresh" :title="$t('message.refresh_connection')+' Ctrl+r / F5'" :class="autoRefresh?'rotating':''"></el-button>
      </el-popover>

      <!-- dump btn -->
      <el-button ref='dumpBtn' type="primary" @click="dumpCommand" icon="fa fa-code" :title="$t('message.dump_to_clipboard')"></el-button>
    </div>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyName: this.redisKey,
      keyTTL: -1,
      binary: false,
      autoRefresh: false,
      refreshInterval: 2000,
    };
  },
  props: ['client', 'redisKey', 'keyType', 'hotKeyScope'],
  methods: {
    initShow() {
      const key = this.redisKey;
      const client = this.client;

      // reset name input
      this.keyName = key;
      this.binary  = !this.$util.bufVisible(key);

      client.ttl(key).then((reply) => {
        this.keyTTL = reply;
      }).catch(e => {
        this.$message.error('TTL Error: ' + e.message);
      });
    },
    changeKeyInput(keyInput) {
      this.keyName = this.binary ? this.$util.xToBuffer(keyInput) : Buffer.from(keyInput);
    },
    refreshKey() {
      this.initShow();
      this.$emit('refreshContent');
    },
    refreshInit() {
      this.refreshTimer && clearInterval(this.refreshTimer);

      if (this.autoRefresh) {
        this.refreshKey();

        this.refreshTimer = setInterval(() => {
          this.refreshKey();
        }, this.refreshInterval);
      }
    },
    removeInterval() {
      this.autoRefresh = false;
      this.refreshInit();
    },
    dumpCommand() {
      this.$emit('dumpCommand');
    },
    deleteKey() {
      this.$confirm(
        this.$t('message.confirm_to_delete_key', { key: this.$util.bufToString(this.redisKey) }),
        { type: 'warning' },
      )
      .then(() => {
        this.client.del(this.redisKey).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.$bus.$emit('removePreTab');
            this.refreshKeyList(this.redisKey);
          }
          else {
            this.$message.error({
              message: `${this.redisKey} ${this.$t('message.delete_failed')}`,
              duration: 1000,
            });
          }
        }).catch(e => {this.$message.error(e.message);});
      }).catch(() => {});
    },
    renameKey(e) {
      // input blur to prevent trigger twice by enter
      e && e.srcElement.blur();

      if (this.keyName.equals(this.redisKey)) {
        return;
      }

      this.$confirm(
          this.$t('message.confirm_to_rename_key', {
            old: this.$util.bufToString(this.redisKey),
            new: this.$util.bufToString(this.keyName),
          }),
          { type: 'warning' },
      ).then(() => {
        this.client.rename(this.redisKey, this.keyName).then((reply) => {
          if (reply === 'OK') {
            this.$message.success({
              message: this.$t('message.modify_success'),
              duration: 1000,
            });

            this.refreshKeyList(this.redisKey);
            this.refreshKeyList(this.keyName, 'add');
            this.$bus.$emit('clickedKey', this.client, this.keyName);
          }
        }).catch(e => {
          this.$message.error('Rename Error: ' + e.message);
        });
      }).catch(() => {});
    },
    ttlKey() {
      // ttl <= 0
      if (this.keyTTL <= 0) {
        this.$confirm(
          this.$t('message.ttl_delete'),
          { type: 'warning' },
        )
        .then(() => {
          this.setTTL(true);
        })
        .catch(() => {});
      }
      else {
        this.setTTL();
      }
    },
    setTTL(keyDeleted = false) {
      this.client.expire(this.redisKey, this.keyTTL).then((reply) => {
        if (reply == 1) {
          this.$message.success({
            message: this.$t('message.modify_success'),
            duration: 1000,
          });

          if (keyDeleted) {
            this.refreshKeyList(this.redisKey);
            this.$bus.$emit('removePreTab');
          }
        }
      }).catch(e => {
        this.$message.error('Expire Error: ' + e.message);
      });
    },
    persistKet() {
      this.client.persist(this.redisKey).then(() => {
        this.initShow();
        this.$message.success(this.$t('message.modify_success'));
      }).catch(e => {
        this.$message.error('Persist Error: ' + e.message);
      });
    },
    refreshKeyList(key, type = 'del') {
      this.$bus.$emit('refreshKeyList', this.client, key, type);
    },
    initShortcut() {
      // refresh
      this.$shortcut.bind('ctrl+r, ⌘+r, f5', this.hotKeyScope, () => {
        // make input blur first
        this.$refs.deleteBtn.$el.focus();
        this.refreshKey();

        return false;
      });
      // delete
      this.$shortcut.bind('ctrl+d, ⌘+d', this.hotKeyScope, () => {
        this.deleteKey();
        return false;
      });
    },
  },
  mounted() {
    this.initShow();
    this.initShortcut();
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer);
    this.$shortcut.deleteScope(this.hotKeyScope);
  },
};
</script>

<style type="text/css">
  .key-detail-type {
    text-transform: capitalize;
    text-align: center;
    min-width: 34px;
    display: inline-block;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .key-header-item {
    /*padding-right: 15px;*/
    /*margin-bottom: 10px;*/
    float: left;
  }

  .key-header-item.key-name-input {
    width: calc(100% - 402px);
    min-width: 220px;
    max-width: 800px;
    margin-right: 15px;
    margin-bottom: 10px;
  }
  .key-header-item.key-ttl-input {
    width: 220px; 
    margin-right: 15px; 
    margin-bottom: 10px;
  }
  /*hide number input button*/
  .key-header-item.key-ttl-input input::-webkit-inner-spin-button,
  .key-header-item.key-ttl-input input::-webkit-outer-spin-button {
    appearance: none;
  }

  .key-header-item.key-header-btn-con .el-button+.el-button {
    margin-left: 4px;
  }

  /*refresh btn rotating*/
  .key-header-info .key-header-btn-con .rotating .el-icon-refresh{
    animation: rotate 1.5s linear infinite;
  }

</style>
