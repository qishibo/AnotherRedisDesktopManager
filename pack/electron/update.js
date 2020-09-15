const { session, ipcMain, net } = require('electron');
const { autoUpdater } = require("electron-updater");

// disable auto download
autoUpdater.autoDownload = false;

let mainEvent;

const update = () => {
  bindMainListener();

  ipcMain.on('update-check', (event, arg) => {
    mainEvent = event;
    autoUpdater.checkForUpdates()
      .then(() => {})
      .catch(err => {
        mainEvent.sender.send('update-error', err);
      });
  });

  ipcMain.on('continue-update', (event, arg) => {
    autoUpdater.downloadUpdate()
      .then(() => {})
      .catch(err => {
        mainEvent.sender.send('update-error', err);
      });
  });
};

function bindMainListener() {
  autoUpdater.on('checking-for-update', () => {});

  autoUpdater.on('update-available', (info) => {
    mainEvent.sender.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    mainEvent.sender.send('update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    mainEvent.sender.send('update-error', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainEvent.sender.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainEvent.sender.send('update-downloaded', info);
  });
};

module.exports = update;
