import keymaster from 'keymaster';
import { ipcRenderer } from 'electron';

// enable shortcut in input, textarea, select
keymaster.filter = e => {
  return true;
}

// prevent ctrl+r
keymaster('ctrl+r, ⌘+r', e => {
  return false;
});

// minimize window
keymaster('ctrl+h, ctrl+m, ⌘+h, ⌘+m', e => {
  ipcRenderer.send('minimizeWindow');
  return false;
});

// toggle maximize
keymaster('ctrl+enter, ⌘+enter', e => {
  ipcRenderer.send('toggleMaximize');
  return false;
});

export default {
  bind: (...args) => keymaster(...args),
  ...keymaster,
}