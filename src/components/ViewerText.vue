<template>
  <div>
    <!-- </textarea> -->
    <el-input ref='textInput' :disabled='disabled' type='textarea' :rows='textrows' :value='contentDisplay' @change="updateContent($event)" @input='inputContent'>
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
  props: ['content', 'contentVisible', 'textrows', 'disabled'],
  computed: {
    contentDisplay() {
      return this.content.toString();
    },
  },
  methods: {
    updateContent(value) {
      // hex mode need confirm when changing
      if (!this.contentVisible && !this.confirmChange) {
        return;
      }
      
      this.$emit('updateContent', Buffer.from(value));
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
        // fill value when first confirm
        this.$emit('updateContent', Buffer.from(value));
        return this.confirmChange = true;
      }).catch(_ => {
        // recovery the input value
        this.$refs.textInput.$refs.textarea.value = this.contentDisplay
      });
    },
  },
}
</script>
