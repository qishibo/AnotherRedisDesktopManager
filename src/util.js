export default {
  data: {},
  get(name) {
    return this.data[name];
  },
  set(name, value) {
    this.data[name] = value;
  },
  isVisible(string) {
    let ele = document.createElement('p');
    ele.innerHTML = string;

    const equal = (ele.innerHTML === string);
    ele = null;

    return equal;
  },
  toUTF8(string) {
    return encodeURI(string).replace(/%/g, '\\x').toLowerCase();
  },
  cutString(string, maxLength = 20) {
    if (string.length <= maxLength) {
      return string;
    }

    return string.substr(0, maxLength) + '...';
  },
  openHrefExternal(e, href) {
    e.preventDefault();
    require('electron').shell.openExternal(href);
  },
};
