const { ipcMain } = require('electron');

ipcMain.on('get-all-fonts', (event, arg) => {
  console.log('main, get-all-fonts...');

  try {
    require('font-manager').getAvailableFonts((fonts) => {
      event.sender.send('send-all-fonts', fonts);
    });
  }
  catch (e) {
    console.log('main.js get fonts failed...', e);
    event.sender.send('send-all-fonts', [{family: "Default Initial"}]);
  }
});
