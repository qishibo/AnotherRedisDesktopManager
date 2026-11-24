<template>
  <el-input
    class="file-input"
    readonly
    :value='file'
    @click.native='onClick'
    @keydown.native.enter.prevent='showFileSelector'
    @keydown.native.space.prevent='showFileSelector'
    :placeholder='placeholder'>
    <i
      v-if="file"
      slot="suffix"
      class="el-input__icon el-icon-circle-close el-input__clear"
      role="button"
      @click.stop='clearFile'>
    </i>
    <i slot="append" class="el-icon-folder-opened" @click.stop='showFileSelector'></i>
  </el-input>
</template>

<script type="text/javascript">
import { remote } from 'electron';

export default {
  props: {
    file: { default: '' },
    bookmark: { default: '' },
    placeholder: { default: 'Select File' },
  },
  methods: {
    clearFile() {
      this.$emit('update:file', '');
      this.$emit('update:bookmark', '');
    },
    onClick(e) {
      if (e.target.closest('.el-input__clear')) {
        return;
      }

      this.showFileSelector();
    },
    showFileSelector() {
      remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        securityScopedBookmarks: true,
        properties: ['openFile', 'showHiddenFiles'],
      }).then((reply) => {
        if (reply.canceled) {
          return;
        }

        reply.filePaths && this.$emit('update:file', reply.filePaths[0]);
        reply.bookmarks && this.$emit('update:bookmark', reply.bookmarks[0]);
      }).catch((e) => {
        this.$message.error(`File Input Error: ${e.message}`);
      });
    },
  },
};
</script>

<style scoped>
  .file-input >>> .el-input__inner,
  .file-input >>> .el-input-group__append {
    cursor: pointer;
  }

  .file-input >>> .el-input-group__append {
    padding: 0 12px;
  }

  .file-input >>> .el-input__clear {
    cursor: pointer;
  }
</style>
