<template>
  <div>
    <!-- </textarea> -->
    <el-input ref='textInput' :disabled='disabled' type='textarea' :value='contentDisplay' @input='inputContent'>
    </el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      confirmChange: false,
    };
  },
  props: ['content', 'contentVisible', 'disabled'],
  computed: {
    contentDisplay() {
      return this.content.toString();
    },
  },
  watch: {
    content() {
      // refresh
      this.$nextTick(() => {
        this.$refs.textInput.$refs.textarea.value = this.contentDisplay;
      });
    },
  },
  methods: {
    getContent() {
      // not changed
      if (!this.contentVisible && !this.confirmChange) {
        return this.content;
      }

      const content = this.$refs.textInput.$refs.textarea.value;
      return Buffer.from(content);
    },
    inputContent(value) {
      // visible content do nothing
      if (this.contentVisible) {
        return;
      }

      // confirmed change content
      if (this.confirmChange) {
        return;
      }

      this.$confirm(this.$t('message.confirm_modify_unvisible_content')).then(_ => {
        return this.confirmChange = true;
      }).catch(_ => {
        // recovery the input value
        this.$refs.textInput.$refs.textarea.value = this.contentDisplay
      });
    },
  },
}
</script>
