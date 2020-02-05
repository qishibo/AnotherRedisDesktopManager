<template>
  <div>
    <el-form :inline="true">
      <!-- key name -->
      <el-form-item>
        <el-input ref="keyNameInput" placeholder="" v-model="syncKeyParams.keyName" @keyup.enter.native="renameKey" placeholder="KeyName">
          <i
            class="el-icon-check el-input__icon cursor-pointer"
            slot="suffix"
            :title="$t('message.click_enter_to_rename')"
            @click="renameKey">
          </i>
          <template slot="prepend"><span class="key-detail-type">{{ keyType }}</span></template>
        </el-input>
      </el-form-item>

      <!-- key ttl -->
      <el-form-item>
        <el-input placeholder="" v-model="syncKeyParams.keyTTL" @keyup.enter.native="ttlKey">
          <i
            class="el-icon-check el-input__icon cursor-pointer"
            slot="suffix"
            :title="$t('message.click_enter_to_ttl')"
            @click="ttlKey">
          </i>
          <template slot="prepend">TTL</template>
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
  props: ['redisKey', 'keyType', 'syncKeyParams'],
  methods: {
    initShow() {
      const client = this.$util.get('client');
      const redisKeyLast = this.redisKeyLast;

      if (!redisKeyLast) {
        return;
      }

      this.syncKeyParams.keyName = redisKeyLast;

      client.ttlAsync(redisKeyLast).then((reply) => {
        this.syncKeyParams.keyTTL = reply;
      });
    },
    deleteKey() {
      this.$confirm(
        this.$t('message.confirm_to_delete_key', { key: this.redisKeyLast }),
        { type: 'warning' },
      ).then(() => {
        this.$util.get('client').delAsync(this.redisKeyLast).then((reply) => {
          if (reply === 1) {
            this.$message.success({
              message: `${this.redisKeyLast} ${this.$t('message.delete_success')}`,
              duration: 1000,
            });

            this.$bus.$emit('removePreTab');
            this.refreshKeyList(this.redisKeyLast);
          } else {
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
      this.$bus.$emit('refreshKey', this.redisKeyLast);
    },
    renameKey() {
      if (this.redisKeyLast === this.syncKeyParams.keyName) {
        return;
      }

      this.$util.get('client').renameAsync(this.redisKeyLast, this.syncKeyParams.keyName).then((reply) => {
        if (reply === 'OK') {
          this.$message.success({
            message: `${this.redisKeyLast} rename to ${this.syncKeyParams.keyName} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.redisKeyLast = this.syncKeyParams.keyName;
          this.refreshKeyList();
          this.$bus.$emit('clickedKey', this.syncKeyParams.keyName);
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
      } else {
        this.setTTL();
      }
    },
    setTTL(removePreTab = false) {
      this.$util.get('client').expireAsync(this.redisKeyLast, this.syncKeyParams.keyTTL).then((reply) => {
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
      this.$bus.$emit('refreshKeyList', key);
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
