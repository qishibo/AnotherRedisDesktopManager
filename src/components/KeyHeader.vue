<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input ref="keyNameInput" placeholder="" v-model="newKeyParams.keyName" @keyup.enter.native="renameKey" placeholder="KeyName">
          <i
            class="el-icon-check el-input__icon cursor-pointer"
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
            class="el-icon-check el-input__icon cursor-pointer"
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
      redisKeyLast: this.redisKey,
    };
  },
  props: ['redisKey', 'keyType', 'newKeyParams'],
  methods: {
    initShow() {
      const redisKey = this.redisKeyLast;
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
        this.$t('message.confirm_to_delete_key', { key: this.redisKeyLast }),
        { type: 'warning' },
      ).then(() => {
        const client = this.$util.get('client');

        client.delAsync(this.redisKeyLast).then((reply) => {
          console.log(`delete ${this.redisKeyLast}`, reply);

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
      console.log(`refreshing ${this.redisKeyLast}`);

      this.newKeyParams.keyName = this.redisKeyLast;

      this.$bus.$emit('refreshKey', this.redisKeyLast);
      this.initShow();
    },
    renameKey() {
      console.log(`remane key ${this.redisKeyLast} new key is ${this.newKeyParams.keyName}`);

      const client = this.$util.get('client');

      if (this.redisKeyLast === this.newKeyParams.keyName) {
        return;
      }

      client.renameAsync(this.redisKeyLast, this.newKeyParams.keyName).then((reply) => {
        console.log(`rename result ${this.redisKeyLast} ${this.newKeyParams.keyName}`, reply);

        if (reply === 'OK') {
          this.$message.success({
            message: `${this.redisKeyLast} rename to ${this.newKeyParams.keyName} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.redisKeyLast = this.newKeyParams.keyName;
          this.refreshKeyList();
          this.$bus.$emit('clickedKey', this.newKeyParams.keyName);
        }
      });
    },
    ttlKey() {
      // ttl <= 0
      if (this.newKeyParams.keyTTL <= 0) {
        this.$confirm(
          this.$t('message.ttl_delete'),
          { type: 'warning' },
        ).then(() => {
          this.setTTL();
        }).catch(() => {});
      } else {
        this.setTTL();
      }
    },
    setTTL() {
      console.log(`ttl key ${this.redisKeyLast} ttl is ${this.newKeyParams.keyTTL}`);

      const client = this.$util.get('client');

      client.expireAsync(this.redisKeyLast, this.newKeyParams.keyTTL).then((reply) => {
        console.log(`expire result ${this.redisKeyLast} ${this.newKeyParams.keyTTL}`);

        if (reply) {
          this.$message.success({
            message: `${this.redisKeyLast} expire ${this.newKeyParams.keyTTL} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.refreshKeyList();
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
