import keymaster from 'keymaster';

// enable shortcut in input, textarea, select
keymaster.filter = e => {
  return true;
}

// prevent ctrl+r
keymaster('ctrl+r', e => {
  return false;
});

export default {
  bind: (...args) => keymaster(...args),
  ...keymaster,
}