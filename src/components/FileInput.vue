<template>
  <el-input
    :value='file'
    clearable
    @clear='clearFile'
    @focus='focus'
    :placeholder='placeholder'>
    <template slot="append">
      <el-button @click='showFileSelector'>...</el-button>
    </template>
  </el-input>
</template>

<script type="text/javascript">
  import {remote} from 'electron';

  export default {
    props: {
      file: {default: ''},
      bookmark: {default: ''},
      placeholder: {default: 'Select File'}
    },
    methods: {
      clearFile() {
        this.$emit('update:file', '');
        this.$emit('update:bookmark', '');
      },
      focus(e) {
        // edit is forbidden, input blur
        e.target.blur();
      },
      showFileSelector() {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
          securityScopedBookmarks: true,
          properties: ['openFile','showHiddenFiles']
        }).then(reply => {
          if (reply.canceled) {
            return;
          }

          reply.filePaths && this.$emit('update:file', reply.filePaths[0]);
          reply.bookmarks && this.$emit('update:bookmark', reply.bookmarks[0]);
        }).catch(e => {
          this.$message.error(`File Input Error: ${e.message}`);
        });
      }
    },
  }
</script>

