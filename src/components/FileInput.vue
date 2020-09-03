<template>
  <el-input
    :value='file'
    clearable
    @clear='clearFile'
    @change="changeValue"
    :placeholder='placeholder'>
    <template slot="append">
      <el-button @click='showFileSelector'>...</el-button>
    </template>
    <template slot='append'>
      <input ref='fileDom' type="file" @change="changeFile($event)" style="display: none">
    </template>
  </el-input>
</template>

<script type="text/javascript">
  export default {
    props: {
      file: {default: ''},
      placeholder: {default: 'Select File'}
    },
    methods: {
      clearFile() {
        this.$refs.fileDom.value = '';
        this.$emit('update:file', '');
      },
      changeValue(value) {
        this.$emit('update:file', value);
      },
      changeFile(e) {
        if (!e.target.files[0]) {
          return;
        }
        this.$emit('update:file', e.target.files[0].path);
      },
      showFileSelector() {
        this.$refs.fileDom.click();
      }
    },
  }
</script>
