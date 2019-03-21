<template>
  <!-- setting dialog -->
  <el-dialog :title="$t('message.settings')" :visible.sync="settingDialog.visible">
    <el-form label-position="top" size="mini">

      <el-form-item :label="$t('message.config_connections')">
        <el-button @click="exportConnection">{{ $t('message.export') }}</el-button>
        <el-button @click="showImportDialog">{{ $t('message.import') }}</el-button>
      </el-form-item>

      <el-dialog
        width="400px"
        :title="$t('message.select_import_file')"
        :visible.sync="importConnectionVisible"
        append-to-body>

        <el-upload
          ref="configUpload"
          :auto-upload="false"
          :multiple="false"
          action=""
          :limit="1"
          :on-change="loadConnectionFile"
          drag>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">{{ $t('message.put_file_here') }}</div>
        </el-upload>

        <div slot="footer" class="dialog-footer">
          <el-button @click="importConnnection">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="settingDialog.visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="saveSettings">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage.js';

export default {
  data() {
    return {
      form: {},
      importConnectionVisible: false,
      connectionFileContent: '',
    };
  },
  props: ['settingDialog'],
  methods: {
    showSettings() {
      let settings = this.getSettings();

      if (!settings) {
        return;
      }

      settings = JSON.parse(settings);

      this.form = settings;
    },
    getSettings() {
      return localStorage.getItem('settings');
    },
    saveSettings() {
      const settings = JSON.stringify(this.form);
      console.log('saving settings...', settings);

      localStorage.setItem('settings', settings);

      this.settingDialog.visible = false;
    },
    showImportDialog() {
      this.importConnectionVisible = true;
    },
    loadConnectionFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => { this.connectionFileContent = event.target.result; };
      reader.readAsText(file.raw);
    },
    importConnnection() {
      this.importConnectionVisible = false;
      let config = atob(this.connectionFileContent);

      if (!config) {
        return;
      }

      config = JSON.parse(config);

      // remove all connections first
      storage.setConnections({});

      for (const line of config) {
        storage.addConnection(line);
      }

      this.$bus.$emit('refreshConnections');

      this.$message.success({
        message: this.$t('message.import_success'),
        duration: 1000,
      });
    },
    exportConnection() {
      let connections = storage.getConnections(true);
      connections = btoa(JSON.stringify(connections));

      this.createAndDownloadFile('connections.ano', connections);

      this.settingDialog.visible = false;
    },
    createAndDownloadFile(fileName, content) {
      const aTag = document.createElement('a');
      const blob = new Blob([content]);

      aTag.download = fileName;
      aTag.href = URL.createObjectURL(blob);

      aTag.click();
      URL.revokeObjectURL(blob);
    },
  },
  mounted() {
    this.showSettings();
  },
};
</script>
