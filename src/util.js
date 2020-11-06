export default {
  data: {},
  get(name) {
    return this.data[name];
  },
  set(name, value) {
    this.data[name] = value;
  },
  bufVisible(buf) {
    if (typeof buf == 'string') {
      return true;
    }

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
      return "\\x" + item.toString(16).padStart(2, 0);
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
  binaryStringToBuffer(str) {
    const groups = str.match(/[01]{8}/g);
    const numbers = groups.map(binary => parseInt(binary, 2))

    return Buffer.from(new Uint8Array(numbers));
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
  cloneObjWithBuff(object) {
    let clone = JSON.parse(JSON.stringify(object));

    for (let i in clone) {
      if ((typeof clone[i] === 'object') && (clone[i].type === 'Buffer')) {
        clone[i] = Buffer.from(clone[i]);
      }
    }

    return clone;
  },
};
