const { app, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const winState = {
  // {x, y, width, height, maximized}
  getLastState() {
    let data = '{}';

    try {
      data = fs.readFileSync(this.getStateFile());
    }
    catch (err) {}

    const lastWinStage = this.parseJson(data);
    const lastX = lastWinStage.x;
    const lastY = lastWinStage.y;

    const primary = screen.getPrimaryDisplay();

    // recovery position only when app in primary screen
    // if in external screens, reset position for uncaught display issues
    if (
      lastX < 0 || lastY < 0 ||
      lastX > primary.workAreaSize.width || lastY > primary.workAreaSize.height
    ) {
      lastWinStage.x = null;
      lastWinStage.y = null;
    }

    // adjust extremely small window
    (lastWinStage.width < 250) && (lastWinStage.width = 1100);
    (lastWinStage.height < 250) && (lastWinStage.height = 728);

    return lastWinStage;

    // // there is some uncaught display issues when display in external screens
    // // such as windows disappears even x < width
    // let screenCanDisplay = false;
    // const displays = screen.getAllDisplays()

    // for (const display of displays) {
    //   const bounds = display.workArea;
    //   // check if there is a screen can display this position
    //   if (bounds.x * lastX > 0 && bounds.y * lastY > 0) {
    //     if (bounds.width > Math.abs(lastX) && bounds.height > Math.abs(lastY)) {
    //       screenCanDisplay = true;
    //       break;
    //     }
    //   }
    // }

    // let state = {...lastWinStage, x: null, y: null};

    // // recovery to last position
    // if (screenCanDisplay) {
    //   state.x = lastX;
    //   state.y = lastY;
    // }

    // return state;
  },

  watchClose(win) {
    win.on('close', () => {
      const winState = this.getWinState(win);

      if (!winState) {
        return;
      }

      this.saveStateToStorage(winState);
    });
  },

  getWinState(win) {
    try {
      const winBounds = win.getBounds();

      let state = {
        x: winBounds.x,
        y: winBounds.y,
        width: winBounds.width,
        height: winBounds.height,
        maximized: win.isMaximized(),
      }

      return state;
    }
    catch (err) {
      return false;
    }
  },

  saveStateToStorage(winState) {
    fs.writeFile(this.getStateFile(), JSON.stringify(winState), (err) => {});
  },

  getStateFile() {
    const userPath = app.getPath('userData');
    const fileName = 'ardm-win-state.json';

    return path.join(userPath, fileName);
  },

  parseJson(str) {
    let json = false;

    try {
      json = JSON.parse(str);
    }
    catch(err) {}

    return json;
  },
};

module.exports = winState;
