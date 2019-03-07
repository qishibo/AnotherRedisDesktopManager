<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="" v-model="myRedisKey" @keyup.enter.native="renameKey">
          <i
            class="el-icon-check el-input__icon"
            slot="suffix"
            :title="$t('message.click_enter_to_rename')"
            @click="renameKey"
            >
          </i>
            <template slot="prepend"><span class="key-detail-type">{{ keyType }}</span></template>
          </el-input>
      </el-form-item>

      <el-form-item>
        <el-input placeholder="" v-model="newKeyParams.keyTTL" @keyup.enter.native="ttlKey">
          <i
            class="el-icon-check el-input__icon"
            slot="suffix"
            :title="$t('message.click_enter_to_ttl')"
            @click="ttlKey"
            >
          </i>
            <template slot="prepend">TTL</template>
          </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="danger" @click="deleteKey" icon="el-icon-delete" circle></el-button>
      </el-form-item>

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
      myRedisKey: this.redisKey,
      myRedisKeyLast: this.redisKey,
      keyTTL: '',
    };
  },
  props: ['redisKey', 'keyType', 'newKeyParams'],
  methods: {
    initShow() {
      const redisKey = this.myRedisKey;
      const client = this.$util.get('client');

      if (!redisKey) {
        return;
      }

      client.ttlAsync(redisKey).then((reply) => {
        console.log(redisKey, reply);
        this.newKeyParams.keyTTL = reply;
      });
    },
    deleteKey() {
      this.$confirm(
        this.$t('message.confirm_to_delete_key', { key: this.myRedisKey }),
        { type: 'warning' },
      ).then(() => {
        const client = this.$util.get('client');

        client.delAsync(this.myRedisKey).then((reply) => {
          console.log(`delete ${this.myRedisKey}`, reply);

          if (reply === 1) {
            this.$message.success({
              message: this.myRedisKey + this.$t('message.delete_success'),
              duration: 1000,
            });

            this.$bus.$emit('removePreTab');
            this.refreshKeyList();
          } else {
            this.$message.error({
              message: this.myRedisKey + this.$t('message.delete_failed'),
              duration: 1000,
            });
          }
        });
      });
    },
    refreshKey() {
      console.log(`refreshing ${this.myRedisKey}`, this.newKeyParams);

      this.$bus.$emit('refreshKey', this.myRedisKey);
      this.initShow();
    },
    renameKey() {
      console.log(`remane key ${this.redisKey} new key is ${this.myRedisKey}`);

      const client = this.$util.get('client');

      if (this.myRedisKeyLast === this.myRedisKey) {
        return;
      }

      client.renameAsync(this.myRedisKeyLast, this.myRedisKey).then((reply) => {
        console.log(`rename result ${this.redisKey} ${this.myRedisKey}`, reply);

        if (reply === 'OK') {
          this.$message.success({
            message: `${this.myRedisKeyLast} rename to ${this.myRedisKey} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.myRedisKeyLast = this.myRedisKey;
          this.refreshKeyList();
        }
      });
    },
    ttlKey() {
      // ttl <= 0
      if (this.newKeyParams.keyTTL <= 0) {
        this.$confirm(
          this.$t('message.ttl_delete', { key: this.myRedisKey }),
          { type: 'warning' },
        ).then(() => {
          this.setTTL();
        }).catch(() => {});
      } else {
        this.setTTL();
      }
    },
    setTTL() {
      console.log(`ttl key ${this.myRedisKey} ttl is ${this.newKeyParams.keyTTL}`);

      const client = this.$util.get('client');

      client.expireAsync(this.myRedisKey, this.newKeyParams.keyTTL).then((reply) => {
        console.log(`expire result ${this.myRedisKey} ${this.keyTTL}`);

        if (reply) {
          this.$message.success({
            message: `${this.myRedisKey} expire ${this.keyTTL} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.refreshKeyList();
        }
      });
    },
    refreshKeyList() {
      this.$bus.$emit('refreshKeyList');
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
