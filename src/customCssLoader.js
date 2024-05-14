import { ipcRenderer } from 'electron';

export default {
  loadCustomCss(src) {
    ipcRenderer.send('load-custom-css', src);
  },
  onCustomCssLoaded(callback, failCallback) {
    ipcRenderer.on('loaded-custom-css', (event, result) => {
      const { code, message, content } = result;
      switch (code) {
        case 'SUCCESS':
          callback(content);
          break;
        default:
          failCallback(code, message);
          break;
      }
    });
  },
};
