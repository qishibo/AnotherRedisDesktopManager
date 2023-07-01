// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fontManager = require('./font-manager');
const winState = require('./win-state');

const url = require('url');
const path = require('path');

// disable GPU for some white screen issues
// app.disableHardwareAcceleration();
// app.commandLine.appendSwitch('disable-gpu');

global.APP_ENV = (process.env.ARDM_ENV === 'development') ? 'development' : 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// handle uncaught exception
process.on('uncaughtException', (err, origin) => {
  if (!err) {
    return;
  }

  dialog.showMessageBoxSync(mainWindow, {
    type: 'error',
    title: 'Whoops! Uncaught Exception', 
    message: err.stack,
    detail: '\nDon\'t worry, I will fix it! 😎😎\n\n'
            + 'Submit issue to: \nhttps://github.com/qishibo/AnotherRedisDesktopManager/'
  });

  process.exit();
});

// auto update
if (APP_ENV === 'production') {
  require('./update')();
}

function createWindow() {
  // get last win stage
  const lastWinStage = winState.getLastState();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: lastWinStage.x,
    y: lastWinStage.y,
    width: lastWinStage.width,
    height: lastWinStage.height,
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      // add this to keep 'remote' module avaiable. Tips: it will be removed in electron 14
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  if (lastWinStage.maximized) {
    mainWindow.maximize();
  }

  winState.watchClose(mainWindow);

  // and load the index.html of the app.
  if (APP_ENV === 'production') {
    // mainWindow.loadFile('index.html');
    mainWindow.loadURL(url.format({
      protocol: 'file',
      slashes: true,
      pathname: path.join(__dirname, 'index.html'),
      query: {version: app.getVersion()},
    }));
  } else {
    mainWindow.loadURL(`http://localhost:9988/?version=${app.getVersion()}`);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('close', () => {
    mainWindow.webContents.send('closingWindow');
  });

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
  app.quit();
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// hide window
ipcMain.on('hideWindow',function() {
  mainWindow && mainWindow.hide();
});
// minimize window
ipcMain.on('minimizeWindow',function() {
  mainWindow && mainWindow.minimize();
});
// toggle maximize
ipcMain.on('toggleMaximize',function() {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
  }
});

// for mac copy paset shortcut
if (process.platform === 'darwin') {
  const template = [
    // { role: 'appMenu' },
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    // { role: 'viewMenu' },
    {
      label: 'View',
      submenu: [
        ...(
          (APP_ENV === 'production') ? [] : [{ role: 'toggledevtools' }]
        ),
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        // { role: 'window' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/qishibo/AnotherRedisDesktopManager')
          }
        }
      ]
    }
  ];

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
