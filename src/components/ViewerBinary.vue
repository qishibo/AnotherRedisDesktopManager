<template>
  <div>
    <!-- </textarea> -->
    <el-input disabled type='textarea' :rows='textrows' :value='binaryValue'></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'textrows', 'contentBuff'],
  computed: {
    binaryValue() {
        let binary = '';

        for (let item of this.contentBuff) {
            binary += item.toString(2).padStart(8, 0);
        }

        return binary;
    },
  },
}
</script>
