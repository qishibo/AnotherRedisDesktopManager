// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron');
const fontManager = require('./font-manager');
const winState = require('./win-state');


global.APP_ENV = (process.env.NODE_ENV === 'dev') ? 'dev' : 'production';

if (APP_ENV === 'production') {
  require('./update')();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // get last win stage
  const lastWinStage = winState.getLastState();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: !isNaN(lastWinStage.x) ? lastWinStage.x : null,
    y: !isNaN(lastWinStage.y) ? lastWinStage.y : null,
    width: lastWinStage.width ? lastWinStage.width : 1100,
    height: lastWinStage.height ? lastWinStage.height : 728,
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  winState.watchClose(mainWindow);

  // and load the index.html of the app.
  if (APP_ENV === 'production') {
    // mainWindow.loadFile('index.html');
    mainWindow.loadURL(`file://${__dirname}/index.html?version=${app.getVersion()}`);
  } else {
    mainWindow.loadURL(`http://localhost:9988/?version=${app.getVersion()}`);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // const contents = mainWindow.webContents;
  // // contents.openFindWindow();
  // contents.findInPage('133');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// for mac copy paset shortcut
if ((process.platform === 'darwin') && (APP_ENV === 'production')) {
  const template = [{
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click () {
          app.quit();
        }
      }
    ]
  }];

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
