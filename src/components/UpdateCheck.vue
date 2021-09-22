<template>
</template>

<script type="text/javascript">
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      manual: false,
      updateChecking: false,
      downloadProcessShow: false,
    };
  },
  created() {
    this.$bus.$on('update-check', (manual = false) => {
      this.manual = manual;

      // update checking running...
      if (this.updateChecking) {
        return;
      }

      this.updateChecking = true;
      this.$notify.closeAll();

      ipcRenderer.send('update-check');
    });
  },
  methods: {
    bindRendererListener() {
      // already bind listening
      if (ipcRenderer.binded) {
        return;
      }

      ipcRenderer.binded = true;

      ipcRenderer.on('update-available', (event, arg) => {
        this.$notify.closeAll();

        const ignoreUpdateKey = `IgnoreUpdateVersion_${arg.version}`;
        // version ignored
        if (!this.manual && localStorage[ignoreUpdateKey]) {
          return this.resetDownloadProcess();
        }

        this.$confirm(arg.releaseNotes, {
          title: `${this.$t('message.update_available')}: ${arg.version}`,
          confirmButtonText: this.$t('message.begin_update'),
          cancelButtonText: this.$t('message.ignore_this_version'),
          dangerouslyUseHTMLString: true,
          duration: 0
        }).then(() => {
          // update btn clicked
          this.manual = true;
          ipcRenderer.send('continue-update');
        }).catch(() => {
          // ignore this version
          localStorage[ignoreUpdateKey] = true;
          this.resetDownloadProcess();
        });
      });

      ipcRenderer.on('update-not-available', (event, arg) => {
        this.$notify.closeAll();
        this.resetDownloadProcess();

        // latest version
        this.manual && this.$notify.success({
          title: this.$t('message.update_not_available'),
          duration: 2000
        });
      });

      ipcRenderer.on('update-error', (event, arg) => {
        this.resetDownloadProcess();

        let message = '';
        let error = (arg.code ? arg.code : arg.message).toLowerCase();

        // auto update check at app init
        if (!this.manual || !error) {
          return;
        }

        // mac not support auto update
        if (error.includes('zip') && error.includes('file')) {
          message = this.$t('message.mac_not_support_auto_update');
        }

        // err_internet_disconnected err_name_not_resolved err_connection_refused
        else {
          message = this.$t('message.update_error') + `: ${error}`;
        }

        this.$notify.error({
          message: message,
          duration: 0,
          dangerouslyUseHTMLString: true,
        });
      });

      ipcRenderer.on('download-progress', (event, arg) => {
        if (!this.downloadProcessShow) {
          const h = this.$createElement;

          this.$notify({
            message: h('el-progress', {
              props: {
                percentage: 0,
              },
              ref: 'downloadProgressBar',
            }),
            duration: 0,
            customClass: 'download-progress-container',
          });

          this.downloadProcessShow = true;
        };

        this.setProgressBar(Math.floor(arg.percent));
      });

      ipcRenderer.on('update-downloaded', (event, arg) => {
        // this.$notify.closeAll();
        this.setProgressBar(100);
        this.resetDownloadProcess();
        this.$notify.success({
          title: this.$t('message.update_downloaded'),
          duration: 0
        });
      });
    },
    setProgressBar(percent) {
      this.downloadProcessShow && 
      this.$refs.downloadProgressBar && 
      this.$set(this.$refs.downloadProgressBar, 'percentage', percent);
    },
    resetDownloadProcess() {
      this.updateChecking = false;
      this.downloadProcessShow = false;
    },
  },
  mounted() {
    this.bindRendererListener();
  },
};
</script>

<style type="text/css">
  .download-progress-container .el-progress {
    width: 280px;
  }
</style>
