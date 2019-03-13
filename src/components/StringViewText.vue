<template>
  <el-form>

    <el-form-item>
      <el-input type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8}" v-model="data.content"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="execSave">{{ $t('message.save') }}</el-button>
    </el-form-item>

  </el-form>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ['data', 'redisKey'],
  methods: {
    execSave() {
      const key = this.data.newKeyParamsReference.keyName;
      const { content } = this.data;
      const ttl = this.data.newKeyParamsReference.keyTTL;

      if (!key) {
        this.$parent.$parent.$parent.$parent.emptyKeyWhenAdding();
        return false;
      }

      console.log(`setting ${key} ${content}`);

      const client = this.$util.get('client');

      client.setAsync(key, content).then((reply) => {
        if (reply === 'OK') {
          // if ttl is setted
          if (ttl > 0) {
            client.expireAsync(key, ttl).then((reply) => {
              console.log(`set ttl to ${ttl}`, reply);
            });
          }

          this.$message.success({
            message: `${key} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });

          this.$bus.$emit('clickedKey', key);
          this.$bus.$emit('refreshKeyList');
        } else {
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
