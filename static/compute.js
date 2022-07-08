const oo = {
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
// console.log(buf, Buffer.isBuffer(buf), '===')
// buf = Buffer.from(buf)
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
  keysToTree(keys, separator = ':', openStatus = {}, forceCut = 20000) {
    // console.log(keys, '-=-=-=')
    let tree = {};
    keys.forEach(key => {
      // console.log(key)
      key = Buffer.from(key)
      // console.log(key)
      let currentNode = tree;
      let keyStr = this.bufToString(key);
      // console.log(keyStr)
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
        // node.nameBuffer = tree[key].nameBuffer.toJSON();
        node.nameBuffer = tree[key].nameBuffer;
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
}


self.addEventListener("message",(event)=>{
  // console.log('worker get data', event.data);
  const re = oo.keysToTree(...event.data);
  // console.log(re)
  self.postMessage(re)
  // console.log(event.data)
})