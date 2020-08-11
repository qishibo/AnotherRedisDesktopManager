<template>
  <div class="string-container-dynamic-height">
    <!-- </textarea> -->
    <el-input type='textarea' :rows='textrows' :value='content' @change="$emit('updateContent', $event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'textrows'],
}
</script>

<style type="text/css">
    /*key content string container calc height*/
    .string-container-dynamic-height {
        min-height: calc(100vh - 350px);
    }
    .string-container-dynamic-height .el-textarea {
        height: 100%;
    }
    .string-container-dynamic-height .el-textarea textarea {
        min-height: 100%;
    }
</style>