<template>
</template>

<script type="text/javascript">
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      updateChecking: false,
      downloadProcessShow: false,
      downloadPercent: 0,
    };
  },
  created() {
    this.$bus.$on('update-check', () => {
      // mac dose not support auto update now
      if (process.platform === 'darwin') {
        // this.$notify.closeAll();
        // this.$notify.error({
        //   title: this.$t('message.mac_not_support_auto_update'),
        //   duration: 3000
        // });
        console.log('mac updating.....');
        // return;
      };

      // update checking running...
      if (this.updateChecking) {
        console.log('already checking running...');
        return;
      }

      this.updateChecking = true;
      this.$notify.closeAll();
      // this.$notify({
      //   title: this.$t('message.update_checking'),
      //   duration: 0
      // });

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
        console.log('update-available', arg);

        this.$notify.closeAll();
        this.$notify({
          // title: this.$t('message.update_available') + ', ' + this.$t('message.update_downloading'),
          title: `${this.$t('message.update_available')}: ${arg.version}, ${this.$t('message.update_downloading')}`,
          dangerouslyUseHTMLString: true,
          message: arg.releaseNotes.replace(/(\<a)/ig, '$1 target="blank"'),
          duration: 0
        });
      });

      ipcRenderer.on('update-not-available', (event, arg) => {
        console.log('update-not-available', arg);

        this.$notify.closeAll();
        this.resetDownloadProcess();
        // this.$notify.success({
        //   title: this.$t('message.update_not_available') + ' ' + arg.version,
        //   duration: 3000
        // });
      });

      ipcRenderer.on('update-error', (event, arg) => {
        console.log('update-error', arg);

        // due to net problems
        if (!arg.code) {
          return;
        }

        // this.$notify.closeAll();
        this.resetDownloadProcess();
        const message = (arg.code === 'ERR_UPDATER_ZIP_FILE_NOT_FOUND') ?
          this.$t('message.mac_not_support_auto_update') :
          (this.$t('message.update_error') + ': ' + arg.code);

        const a = this.$notify.error({
          title: message,
          duration: 0
        });
      });

      ipcRenderer.on('download-progress', (event, arg) => {
        console.log('download-progress', arg);

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
        console.log('update-downloaded', arg);

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
      this.downloadProcessShow && this.$set(this.$refs.downloadProgressBar, 'percentage', percent);
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
