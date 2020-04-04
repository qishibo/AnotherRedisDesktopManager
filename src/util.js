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
  bufToString(buf) {
    // buff visible
    if (buf.equals(Buffer.from(buf.toString()))) {
      return buf.toString();
    }

    return this.bufToHex(buf);
  },
  bufToHex(buf) {
    let result = buf.toJSON().data.map(item => {
      if (item >= 32 && item <= 126) {
        return String.fromCharCode(item);
      }
      return "\\x" + item.toString(16);
    });

    return result.join('');
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
  isJson(string) {
    try {
      let obj = JSON.parse(string);
      return !!obj && typeof obj === 'object';
    } catch (e) {}

    return false;
  },
  openHrefExternal(e, href) {
    e.preventDefault();
    require('electron').shell.openExternal(href);
  },
};
