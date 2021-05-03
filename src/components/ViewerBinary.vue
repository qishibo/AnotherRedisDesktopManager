<template>
  <div>
    <!-- </textarea> -->
    <el-input :disabled='disabled' type='textarea' :rows='textrows' :value='binaryValue' @change="updateContent($event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'textrows', 'disabled'],
  computed: {
    binaryValue() {
      let binary = '';

      for (let item of this.content) {
          binary += item.toString(2).padStart(8, 0);
      }

      return binary;
    },
  },
  methods: {
    updateContent(value) {
      let newContent = this.$util.binaryStringToBuffer(value);
      this.$emit('updateContent', newContent);
    },
  },
}
</script>
