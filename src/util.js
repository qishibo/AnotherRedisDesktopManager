export default {
  data: {},
  get(name) {
    return this.data[name];
  },
  set(name, value) {
    this.data[name] = value;
  },
  bufVisible(buf) {
    return buf.equals(Buffer.from(buf.toString()));
  },
  bufToString(buf) {
    if (typeof buf == 'string') {
      return buf;
    }

    if (this.bufVisible(buf)) {
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
  xToBuffer(str) {
    let result = '';

    for(var i = 0; i < str.length;) {
      if (str.substr(i, 2) == "\\x") {
        result += str.substr(i + 2, 2);
        i+=4;
      }
      else {
        result += Buffer.from(str[i++]).toString('hex')
      }
    }

    return Buffer.from(result, 'hex');
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
  base64Encode(str) {
    return (new Buffer(str, 'utf8')).toString('base64');
  },
  base64Decode(str) {
    return (new Buffer(str, 'base64')).toString('utf8');
  },
};
