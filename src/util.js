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
  bufToString(buf, forceHex = false) {
    // if (typeof buf == 'string') {
    //   return buf;
    // }

    if (!Buffer.isBuffer(buf)) {
      return buf;
    }

    if (!forceHex && this.bufVisible(buf)) {
      return buf.toString();
    }

    return this.bufToHex(buf);
  },
  bufToQuotation(buf) {
    const str = this.bufToString(buf).replaceAll('"', '\\"');
    return `"${str}"`;
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
  bufToBinary(buf) {
    let binary = '';

    for (let item of buf) {
        binary += item.toString(2).padStart(8, 0);
    }

    return binary;
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
  isPHPSerialize(str) {
    const phpSerialize = require('php-serialize');

    try {
      phpSerialize.unserialize(str);
      return true;
    }catch (e) {}

    return false;
  },
  isMsgpack(buf) {
    const decode = require('@msgpack/msgpack').decode;

    try {
      const result = decode(buf);
      if (['object', 'string'].includes(typeof result)) {
        return true;
      }
    }
    catch (e) {}

    return false;
  },
  isBrotli(buf) {
    return typeof this.zippedToString(buf, 'brotli') === 'string'
  },
  isGzip(buf) {
    return typeof this.zippedToString(buf, 'gzip') === 'string';
  },
  isDeflate(buf) {
    return typeof this.zippedToString(buf, 'deflate') === 'string';
  },
  isProtobuf(buf) {
    // fix #859, #880, exclude number type
    if (!isNaN(buf)) {
      return false;
    }

    const getData = require('rawproto').getData;

    try {
      getData(buf);
      return true;
    }
    catch (e) {}

    return false;
  },
  zippedToString(buf, type = 'unzip') {
    const zlib   = require('zlib');
    const funMap = {
      // unzip will automatically detect Gzip or Deflate header
      'unzip': 'unzipSync',
      'gzip': 'gunzipSync',
      'deflate': 'inflateSync',
      'brotli': 'brotliDecompressSync',
    };

    try {
      const decompressed = zlib[funMap[type]](buf);

      if (Buffer.isBuffer(decompressed) && decompressed.length) {
        return decompressed.toString();
      }
    }
    catch (e) {}

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
  keysToList(keys) {
    return keys.map(key => {
      let item = {
        name: this.bufToString(key),
        nameBuffer: key.toJSON(),
      };

      item.key = item.name;
      return item;
    });
  },
  keysToTree(keys, separator = ':', openStatus = {}, forceCut = 20000) {
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

    // to tree format
    return this.formatTreeData(tree, '', openStatus, separator, forceCut);
  },
  formatTreeData(tree, previousKey = '', openStatus = {}, separator = ':', forceCut = 20000) {
    return Object.keys(tree).map(key => {
      let node = { name: key ? key : '[Empty]'};

      // folder node
      if (!tree[key].keyNode && Object.keys(tree[key]).length > 0) {
        // fullName
        let tillNowKeyName = previousKey + key + separator;

        // folder's fullName may same with key name, such as 'aa-'
        // for unique, add 'F' prefix
        node.key      = `F${tillNowKeyName}`;
        node.open     = openStatus.has(node.key);
        node.children = this.formatTreeData(tree[key], tillNowKeyName, openStatus, separator, forceCut);
        node.keyCount = node.children.reduce((a, b) => a + (b.keyCount || 1), 0);
        // too many children, force cut, do not incluence keyCount display
        // node.open && node.children.length > forceCut && node.children.splice(forceCut);
        // keep folder node in front of the tree and sorted(not include the outest list)
        // async sort, only for opened folders
        node.open && this.sortKeysAndFolder(node.children);
        node.fullName = tillNowKeyName;
      }
      // key node
      else {
        // node.keyCount = 1;
        node.name = key.replace(/`k`$/, '');
        node.nameBuffer = tree[key].nameBuffer.toJSON();
        node.key = node.name;
      }

      return node;
    });
  },
  // nodes is reference, keep folder in front and sorted,
  // keep keys in tail and sorted
  // sortByData
  sortKeysAndFolder(nodes) {
    nodes.sort(function(a, b) {
      // a & b are all keys
      if (!a.children && !b.children) {
        return a.name > b.name ? 1 : -1;
      }
      // a & b are all folder
      else if (a.children && b.children) {
        return a.name > b.name ? 1 : -1;
      }

      // a is folder, b is key
      else if (a.children) {
        return -1;
      }
      // a is key, b is folder
      else {
        return 1;
      }
    });
  },
  // sortByTreeNode
  sortByTreeNodes(nodes) {
    nodes.sort(function(a, b) {
      // a & b are all keys
      if (a.isLeaf && b.isLeaf) {
        return a.label > b.label ? 1 : -1;
      }
      // a & b are all folder
      else if (!a.isLeaf && !b.isLeaf) {
        return a.label > b.label ? 1 : -1;
      }

      // a is folder, b is key
      else if (!a.isLeaf) {
        return -1;
      }
      // a is key, b is folder
      else {
        return 1;
      }
    });
  },
  copyToClipboard(text) {
    const clipboard = require('electron').clipboard;
    clipboard.writeText(text ? text.toString() : '');
  },
  debounce(func, wait, immediate = false, context = null) {
    let timeout, result;

    const debounced = function() {
      const args = arguments;
      timeout && clearTimeout(timeout);

      const later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };

      const callNow = immediate && !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);

      return result;
    }
    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  },
  listSplice(lines, uniq, replacement = null) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].uniq === uniq) {
        replacement ? lines.splice(i, 1, replacement) : lines.splice(i, 1);
        break;
      }
    }
  },
  randomString(len = 5) {
    return Math.random().toString(36).substr(-len);
  },
};
