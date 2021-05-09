<template>
  <div>
    <!-- </textarea> -->
    <el-input :disabled='disabled' type='textarea' :rows='textrows' :value='contentDisplay' @change="updateContent($event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'contentVisible', 'textrows', 'disabled'],
  computed: {
    contentDisplay() {
      return this.$util.bufToString(this.content);
    },
  },
  methods: {
    updateContent(value) {
      let newContent = this.$util.xToBuffer(value);
      this.$emit('updateContent', newContent);
    },
  },
}
</script>
