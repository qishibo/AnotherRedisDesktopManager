const { ipcMain } = require('electron');

ipcMain.on('get-all-fonts', (event, arg) => {
  console.log('main, get-all-fonts...');

  require('font-manager').getAvailableFonts((fonts) => {
    event.sender.send('send-all-fonts', fonts);
  });
});
