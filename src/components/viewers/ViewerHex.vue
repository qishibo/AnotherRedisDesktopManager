<template>
  <div>
    <!-- </textarea> -->
    <el-input ref='textInput' :disabled='disabled' type='textarea' v-model='contentDisplay'></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      contentDisplay: ""
    }
  },
  props: ['content', 'contentVisible', 'disabled'],
  watch: {
    content(val) {
      // refresh
      this.contentDisplay = this.$util.bufToString(val);
    },
  },
  methods: {
    getContent() {
      return this.$util.xToBuffer(this.contentDisplay);
    },
  },
  mounted() {
    this.contentDisplay = this.$util.bufToString(this.content);
  },
}
</script>
