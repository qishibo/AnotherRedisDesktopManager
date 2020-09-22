<template>
  <div>
    <el-form :inline="true">
      <!-- key name -->
      <el-form-item>
        <el-input
          ref="keyNameInput"
          :value="$util.bufToString(keyName)"
          @change='changeKeyInput'
          @keyup.enter.native="renameKey"
          placeholder="KeyName">
          <span slot="prepend" class="key-detail-type">{{ keyType }}</span>
          <i class="el-icon-check el-input__icon cursor-pointer"
            slot="suffix"
            :title="$t('message.click_enter_to_rename')"
            @click="renameKey">
          </i>
        </el-input>
      </el-form-item>

      <!-- key ttl -->
      <el-form-item>
        <el-input v-model="keyTTL" @keyup.enter.native="ttlKey">
          <span slot="prepend">TTL</span>
          <i class="el-icon-check el-input__icon cursor-pointer"
            slot="suffix"
            :title="$t('message.click_enter_to_ttl')"
            @click="ttlKey">
          </i>
        </el-input>
      </el-form-item>

      <!-- del refresh key btn -->
      <el-form-item>
        <el-button type="danger" @click="deleteKey" icon="el-icon-delete" ></el-button>
        <el-button type="success" @click="refreshKey" icon="el-icon-refresh" ></el-button>
      </el-form-item>
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
  props: ['client', 'redisKey', 'keyType'],
  methods: {
    initShow() {
      const key = this.redisKey;
      const client = this.client;

      // reset name input
      this.keyName = key;
      this.binary  = !this.$util.bufVisible(key);

      client.ttl(key).then((reply) => {
        this.keyTTL = reply;
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
        });
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
          this.$message.error({
            message: e.message,
            duration: 3000,
          });
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
      });
    },
    refreshKeyList(key, type = 'del') {
      this.$bus.$emit('refreshKeyList', this.client, key, type);
    },
  },
  mounted() {
    this.initShow();
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
</style>
