const { ipcMain } = require('electron');

ipcMain.on('get-all-fonts', (event, arg) => {
  try {
    require('font-manager').getAvailableFonts((fonts) => {
      event.sender.send('send-all-fonts', fonts);
    });
  }
  catch (e) {
    event.sender.send('send-all-fonts', [{family: "Default Initial"}]);
  }
});
