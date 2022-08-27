<template>
  <div>
    <!-- </textarea> -->
    <el-input ref='textInput' :disabled='disabled' type='textarea' v-model='contentDisplay' @input='inputContent'>
    </el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      confirmChange: false,
      contentDisplay: "",
      oldContentDisplay: "",
    };
  },
  props: ['content', 'contentVisible', 'disabled'],
  watch: {
    content(val) {
      // refresh
      this.contentDisplay = val.toString();
      this.oldContentDisplay = this.contentDisplay;
    },
  },
  methods: {
    getContent() {
      // not changed
      if (!this.contentVisible && !this.confirmChange) {
        return this.content;
      }

      return Buffer.from(this.contentDisplay);
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
        this.contentDisplay = this.oldContentDisplay;
      });
    },
  },
  mounted() {
    this.contentDisplay = this.content.toString();
    this.oldContentDisplay = this.contentDisplay;
  },
}
</script>
