<template>
  <div>
    <!-- <el-tag v-if="!buffVisible" class='input-binary-tag' size="mini">[Hex]</el-tag> -->
    <el-input :disabled='disabled' :value='contentDisplay' @change="updateContent($event)" :placeholder="placeholder">
      <template v-if="!buffVisible" slot="prefix">Hex</template>
    </el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: {
    content: { default: () => Buffer.from('') },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
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
      const newContent = this.buffVisible ? Buffer.from(value) : this.$util.xToBuffer(value);
      this.$emit('update:content', newContent);
    },
  },
};
</script>

<style type="text/css">
  .input-binary-tag {
    font-size: 80%;
  }
</style>
