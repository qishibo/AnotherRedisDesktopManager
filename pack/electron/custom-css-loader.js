const { ipcMain } = require('electron');
const fs = require('fs');

ipcMain.on('load-custom-css', (event, arg) => {
  fs.access(arg, fs.constants.R_OK, (err) => {
    if (err) {
      event.sender.send('loaded-custom-css', {
        code: 'NOT_READABLE',
      });
    } else {
      fs.readFile(arg, 'utf-8', (readErr, data) => {
        if (readErr) {
          event.sender.send('loaded-custom-css', {
            code: 'FAIL',
            message: readErr.message,
          });
        } else {
          event.sender.send('loaded-custom-css', {
            code: 'SUCCESS',
            content: data.toString(),
          });
        }
      });
    }
  });
});
