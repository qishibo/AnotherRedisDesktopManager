<template>
  <div>
    <span v-if="!buffVisible" class='input-binary-tag'>[Hex]</span>
    <el-input :value='contentDisplay' @change="updateContent($event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content'],
  computed: {
    contentDisplay() {
      if (!this.content) {
        return '';
      }

      return this.$util.bufToString(this.content);
    },
    buffVisible() {
      if (!this.content) {
        return true;
      }

      return this.$util.bufVisible(this.content);
    },
  },
  methods: {
    updateContent(value) {
      let newContent = this.buffVisible ? Buffer.from(value) : this.$util.xToBuffer(value);
      this.$emit('update:content', newContent);
    },
  },
}
</script>

<style type="text/css">
  .input-binary-tag {
    color: #7ab3ef;
    font-size: 80%;
    /*float: left;*/
  }
</style>
