<template>
  <el-form>

    <el-form-item>
      <el-input type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8}" v-model="content.content"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">Save</el-button>
    </el-form-item>

  </el-form>
</template>

<script>
  export default{
    data() {
      return {
        //
      };
    },
    props: ['content'],
    // computed: {
    //   newContent: {
    //     get() {
    //       return this.content;
    //     },
    //     set(val) {
    //       this.content = val;
    //     }
    //   }
    // }
  }
</script>
