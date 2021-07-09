<template>
  <div class="size-too-large-viewer">
    <el-alert
      :closable='false'
      :title='alertTitle'
      type="error">
    </el-alert>
    <el-input :disabled='true' type='textarea' :rows='textrows' :value='contentDisplay'></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      firstChars: 20000,
    };
  },
  props: ['content', 'contentVisible', 'textrows', 'disabled'],
  computed: {
    contentDisplay() {
      return this.$util.bufToString(this.content.slice(0, this.firstChars), false) 
              + `...Show only the first ${this.firstChars} characters, the rest has been hidden...`;
    },
    alertTitle() {
      return `Size too large, show only the first ${this.firstChars} characters and you cannot edit it.`;
    },
  },
}
</script>

<style type="text/css">
  .size-too-large-viewer .el-alert {
    margin: 10px 0;
    color: #f56c6c;
    background-color: #f9dbdb;
  }
</style>
