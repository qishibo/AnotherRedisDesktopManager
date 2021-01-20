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
  humanFileSize(size = 0) {
    if (!size) {
      return 0;
    }
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ['B', 'kB', 'MB', 'GB', 'TB'][i];
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
  keysToTree(keys, separator = ':', openStatus = {}) {
    let tree = {};
    keys.forEach(key => {
      let currentNode = tree;
      let keyStr = this.bufToString(key);
      let keySplited = keyStr.split(separator);
      let lastIndex = keySplited.length - 1;

      keySplited.forEach((value, index) => {
        // key node
        if (index === lastIndex) {
          currentNode[keyStr + '`k`'] = {
            keyNode: true,
            nameBuffer: key,
          };
        }
        // folder node
        else {
          (currentNode[value] === undefined) && (currentNode[value] = {});
        }

        currentNode = currentNode[value];
      });
    });

    return this.formatTreeData(tree, '', openStatus)
  },
  formatTreeData(tree, previousKey = '', openStatus = {}) {
    return Object.keys(tree).map(key => {
      let node = { name: key};

      if (!tree[key].keyNode && Object.keys(tree[key]).length > 0) {
        let tillNowKeyName = previousKey + key;
        node.open     = !!openStatus[tillNowKeyName];
        node.children = this.formatTreeData(tree[key], tillNowKeyName, openStatus);
        node.keyCount = node.children.reduce((a, b) => a + (b.keyCount || 0), 0);
      }
      else {
        node.keyCount = 1;
        node.name = key.replace(/`k`$/, '');
        node.nameBuffer = tree[key].nameBuffer.toJSON();
      }

      return node;
    });
  }
};
