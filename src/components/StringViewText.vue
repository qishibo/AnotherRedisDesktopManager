<template>
  <el-form>

    <el-form-item>
      <el-input type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8}" v-model="content.content"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="execSave">Save</el-button>
    </el-form-item>

  </el-form>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ['content', 'redisKey'],
  methods: {
    execSave() {
      const key = this.redisKey;
      const { content } = this.content;

      console.log(`setting ${key} ${content}`);

      const client = this.$util.get('client');

      client.setAsync(key, content).then((reply) => {
        if (reply === 'OK') {
          this.$message.success({
            message: `${key} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });
        } else {
          this.$message.error({
            message: `${key} ${$t('message.modify_failed')}`,
            duration: 1000,
          });
        }
      });
    },
  },
};
</script>
