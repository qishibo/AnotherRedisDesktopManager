<template>
  <div>
    <el-form :inline="true">
      <!-- key name -->
      <el-col :span=12 class='key-header-item key-name-input'>
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
      </el-col>

      <!-- key ttl -->
      <el-col :span=6 class='key-header-item key-ttl-input'>
        <el-input
          v-model="keyTTL"
          @keyup.enter.native="ttlKey"
          :title="$t('message.click_enter_to_ttl')">
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
      </el-col>

      <!-- del & refresh btn -->
      <el-col :span=6 class='key-header-item key-header-btn-con'>
        <el-button ref='deleteBtn' type="danger" @click="deleteKey" icon="el-icon-delete" :title="$t('el.upload.delete')+' Crtl+x'"></el-button>
        <el-button ref='refreshBtn' type="success" @click="refreshKey" icon="el-icon-refresh" :title="$t('message.refresh_connection')+' Ctrl+r / F5'"></el-button>
      </el-col>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyName: this.redisKey,
      keyTTL: -1,
      binary: false,
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
    deleteKey() {
      this.$confirm(
        this.$t('message.confirm_to_delete_key', { key: this.$util.bufToString(this.redisKey) }),
        { type: 'warning' },
      )
      .then(() => {
        this.client.del(this.redisKey).then((reply) => {
          if (reply === 1) {
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
        if (reply) {
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
    padding-right: 15px;
    margin-bottom: 10px;
  }

  .key-header-item.key-name-input {
    min-width: 317px;
    max-width: 650;
  }
  .key-header-item.key-ttl-input {
    min-width: 200px;
    max-width: 400px;
  }
  .key-header-item.key-header-btn-con {
    width: 130px;
  }
</style>
