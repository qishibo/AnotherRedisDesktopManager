<template>
  <div>
    <!-- </textarea> -->
    <el-input type='textarea' :rows='textrows' :value='contentDisplay' @change="updateContent($event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'contentVisible', 'textrows'],
  computed: {
    contentDisplay() {
      return this.$util.bufToString(this.content);
    },
  },
  methods: {
    updateContent(value) {
      let newContent = this.contentVisible ? Buffer.from(value) : this.$util.xToBuffer(value);
      this.$emit('updateContent', newContent);
    },
  },
}
</script>
