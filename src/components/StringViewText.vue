<template>
  <el-form>
    <!-- key content textarea -->
    <el-form-item>
      <el-input type="textarea" size="small" rows="12" v-model="$parent.$data.content"></el-input>
    </el-form-item>

    <!-- save btn -->
    <el-form-item>
      <el-button type="primary" @click="execSave">{{ $t('message.save') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      syncKeyParams: this.$parent.$props.syncKeyParams,
    };
  },
  props: ['redisKey'],
  methods: {
    execSave() {
      const key = this.syncKeyParams.keyName;
      const ttl = this.syncKeyParams.keyTTL;
      const content = this.$parent.$data.content;

      if (!key) {
        this.$parent.$parent.$parent.emptyKeyWhenAdding();
        return false;
      }

      const client = this.$parent.$props.client;

      client.setAsync(key, content).then((reply) => {
        if (reply === 'OK') {
          // if ttl is setted
          if (ttl > 0) {
            client.expireAsync(key, ttl).then((reply) => {});
          }

          this.$message.success({
            message: `${key} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          // if in new key mode, exec refreshAfterAdd
          this.redisKey ? this.$parent.initShow() : this.$parent.$parent.$parent.refreshAfterAdd(key);
        }

        else {
          this.$message.error({
            message: `${key} ${this.$t('message.modify_failed')}`,
            duration: 1000,
          });
        }
      });
    },
  },
};
</script>
