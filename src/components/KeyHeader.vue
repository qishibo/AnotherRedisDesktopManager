<template>
  <div>
    <el-form :inline="true">
      <!-- key name -->
      <el-form-item>
        <el-input ref="keyNameInput" v-model="syncKeyParams.keyName" @keyup.enter.native="renameKey" placeholder="KeyName">
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
        <el-input v-model="syncKeyParams.keyTTL" @keyup.enter.native="ttlKey">
          <span slot="prepend">TTL</span>
          <i class="el-icon-check el-input__icon cursor-pointer"
            slot="suffix"
            :title="$t('message.click_enter_to_ttl')"
            @click="ttlKey">
          </i>
        </el-input>
      </el-form-item>

      <!-- del key btn -->
      <el-form-item>
        <el-button type="danger" @click="deleteKey" icon="el-icon-delete" circle></el-button>
      </el-form-item>

      <!-- refresh key btn -->
      <el-form-item>
        <el-button type="success" @click="refreshKey" icon="el-icon-refresh" circle></el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      redisKeyLast: this.redisKey,
    };
  },
  props: ['client', 'redisKey', 'keyType', 'syncKeyParams'],
  methods: {
    initShow() {
      const client = this.client;
      const redisKeyLast = this.redisKeyLast;

      if (!redisKeyLast) {
        return;
      }

      this.syncKeyParams.keyName = redisKeyLast;

      client.ttl(redisKeyLast).then((reply) => {
        this.syncKeyParams.keyTTL = reply;
      });
    },
    deleteKey() {
      this.$confirm(
        this.$t('message.confirm_to_delete_key', { key: this.redisKeyLast }),
        { type: 'warning' },
      ).then(() => {
        this.client.del(this.redisKeyLast).then((reply) => {
          if (reply === 1) {
            this.$message.success({
              message: `${this.redisKeyLast} ${this.$t('message.delete_success')}`,
              duration: 1000,
            });

            this.$bus.$emit('removePreTab');
            this.refreshKeyList(this.redisKeyLast);
          }
          else {
            this.$message.error({
              message: `${this.redisKeyLast} ${this.$t('message.delete_failed')}`,
              duration: 1000,
            });
          }
        });
      });
    },
    refreshKey() {
      this.initShow();
      this.$emit('refreshContent');
    },
    renameKey() {
      if (this.redisKeyLast === this.syncKeyParams.keyName) {
        return;
      }

      this.client.rename(this.redisKeyLast, this.syncKeyParams.keyName).then((reply) => {
        if (reply === 'OK') {
          this.$message.success({
            message: `${this.redisKeyLast} rename to ${this.syncKeyParams.keyName} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.redisKeyLast = this.syncKeyParams.keyName;
          this.refreshKeyList();
          this.$bus.$emit('clickedKey', this.client, this.syncKeyParams.keyName);
        }
      });
    },
    ttlKey() {
      // ttl <= 0
      if (this.syncKeyParams.keyTTL <= 0) {
        this.$confirm(
          this.$t('message.ttl_delete'),
          { type: 'warning' },
        ).then(() => {
          this.setTTL(true);
        }).catch(() => {});
      }
      else {
        this.setTTL();
      }
    },
    setTTL(removePreTab = false) {
      this.client.expire(this.redisKeyLast, this.syncKeyParams.keyTTL).then((reply) => {
        if (reply) {
          this.$message.success({
            message: `${this.redisKeyLast} expire ${this.syncKeyParams.keyTTL} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.refreshKeyList();
          removePreTab && this.$bus.$emit('removePreTab');
        }
      });
    },
    refreshKeyList(key) {
      this.$bus.$emit('refreshKeyList', this.client, key);
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
    width: 28px;
    display: inline-block;
  }
</style>
