const { session, ipcMain, net } = require('electron');
const { autoUpdater } = require("electron-updater");

let mainEvent;

const update = () => {
  bindMainListener();

  ipcMain.on('update-check', (event, arg) => {
    console.log('update-check begining..............');
    mainEvent = event;
    autoUpdater.checkForUpdates(event);
  });
};

function bindMainListener() {
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available...', info);
    mainEvent.sender.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available...', info);
    mainEvent.sender.send('update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater... Download manual, please... ' + err);
    mainEvent.sender.send('update-error', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Downloading...${progressObj.bytesPerSecond}, ${progressObj.percent}%, ${progressObj.transferred}/${progressObj.total}`;
    console.log(log_message);

    mainEvent.sender.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded...');
    // autoUpdater.quitAndInstall();

    mainEvent.sender.send('update-downloaded', info);
  });
};

module.exports = update;
