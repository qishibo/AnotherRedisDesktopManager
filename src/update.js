import { ipcRenderer } from 'electron';

bindRendererListener();

let globalVue;

const update = (vue) => {
  globalVue = vue;

  // mac dose not support auto update now
  if (process.platform === 'darwin') {
    globalVue.$notify.closeAll();
    globalVue.$notify.error({
      title: globalVue.$t('message.mac_not_support_auto_update'),
      duration: 3000
    });

    return;
  };

  ipcRenderer.send('update-check');
};

function bindRendererListener()
{
  ipcRenderer.on('update-available', (event, arg) => {
    console.log('update-available', arg);

    globalVue.$notify.closeAll();
    globalVue.$notify({
      title: globalVue.$t('message.update_available') + ', ' + globalVue.$t('message.update_downloading'),
      dangerouslyUseHTMLString: true,
      message: arg.releaseNotes.replace(/(\<a)/ig, '$1 target="blank"'),
      duration: 0
    });
  });

  ipcRenderer.on('update-not-available', (event, arg) => {
    console.log('update-not-available', arg);

    globalVue.$notify.closeAll();
    globalVue.$notify.success({
      title: globalVue.$t('message.update_not_available') + ' ' + arg.version,
      duration: 3000
    });
  });

  ipcRenderer.on('update-error', (event, arg) => {
    console.log('update-error', arg);

    globalVue.$notify.closeAll();
    globalVue.$notify.error({
      title: globalVue.$t('message.update_error') + ': ' + arg.cause.code,
      duration: 3000
    });
  });

  ipcRenderer.on('download-progress', (event, arg) => {
    console.log('download-progress', arg);

    globalVue.downloadShow = true;
    globalVue.downloadProgress = Math.floor(arg.percent);
  });

  ipcRenderer.on('update-downloaded', (event, arg) => {
    console.log('update-downloaded', arg);

    globalVue.downloadShow = false;
    globalVue.$notify.closeAll();

    globalVue.$notify.success({
      title: globalVue.$t('message.update_downloaded'),
      duration: 0
    });
  });
}

export default update;
