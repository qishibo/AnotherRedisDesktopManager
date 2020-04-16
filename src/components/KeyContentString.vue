<template>
<el-form class='key-content-string'>
  <!-- key content textarea -->
  <el-form-item>
    <FormatViewer
      :content.sync='content'
      :binary='binary'
      float='left'
      :textrows=12>
    </FormatViewer>
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
      binary: false,
    };
  },
  props: ['client', 'redisKey'],
  components: { FormatViewer },
  methods: {
    initShow() {
      this.client.getBuffer(this.redisKey).then((reply) => {
        this.content = this.$util.bufToString(reply);
        this.binary = !this.$util.bufVisible(reply);
      });
    },
    execSave() {
      const key = this.redisKey;

      this.client.set(
        key,
        this.binary ? this.$util.xToBuffer(this.content) : this.content
      ).then((reply) => {
        if (reply === 'OK') {
          this.initShow()

          this.$message.success({
            message: `${this.$util.bufToString(key)} ${this.$t('message.modify_success')}`,
            duration: 1000,
          });
        }

        else {
          this.$message.error({
            message: `${this.$util.bufToString(key)} ${this.$t('message.modify_failed')}`,
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
