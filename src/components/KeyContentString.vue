<template>
<el-form class='key-content-string'>
  <!-- key content textarea -->
  <el-form-item>
    <FormatViewer :content.sync='content' float='left' :textrows=12></FormatViewer>
  </el-form-item>

  <!-- save btn -->
  <el-form-item>
    <el-button type="primary" @click="execSave">{{ $t('message.save') }}</el-button>
  </el-form-item>
</el-form>
</template>

<script>
import FormatViewer from '@/components/FormatViewer';

export default {
  data() {
    return {
      content: '',
    };
  },
  props: ['client', 'redisKey', 'syncKeyParams'],
  components: { FormatViewer },
  methods: {
    initShow() {
      const key = this.syncKeyParams.keyName;

      if (!key) {
        return;
      }

      this.client.getAsync(key).then((reply) => {
        // character not visible
        if (!this.$util.isVisible(reply)) {
          this.content = this.$util.toUTF8(reply);
        }

        else {
          this.content = reply;
        }
      });
    },
    execSave() {
      const key = this.syncKeyParams.keyName;
      const ttl = this.syncKeyParams.keyTTL;
      const client = this.client;

      if (!key) {
        this.$parent.$parent.emptyKeyWhenAdding();
        return;
      }

      client.setAsync(key, this.content).then((reply) => {
        if (reply === 'OK') {
          // if ttl is setted
          if (ttl > 0) {
            client.expireAsync(key, ttl).then(() => {});
          }

          // if in new key mode, exec refreshAfterAdd
          this.redisKey ? this.initShow() : this.$parent.$parent.refreshAfterAdd(key);

          this.$message.success({
            message: `${key} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });
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
  mounted() {
    this.initShow();
  },
};
</script>

<style type="text/css">
  .key-content-string .text-formated-container {
    min-height: 228px;
  }
</style>
