// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
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
    x: (lastWinStage.x > 0) ? lastWinStage.x : null,
    y: (lastWinStage.y > 0) ? lastWinStage.y : null,
    width: (lastWinStage.width > 250) ? lastWinStage.width : 1100,
    height: (lastWinStage.height > 250) ? lastWinStage.height : 728,
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      // add this to keep 'remote' module avaiable. Tips: it will be removed in electron 14
      enableRemoteModule: true,
    },
  });

  if (lastWinStage.maximized) {
    mainWindow.maximize();
  }

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
