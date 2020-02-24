<template>
  <div>
    <el-input type='textarea' :rows='textrows' :value='content' @change="$emit('updateContent', $event)"></el-input>
  </div>
</template>

<script type="text/javascript">
export default {
  props: ['content', 'textrows'],
}
</script>
