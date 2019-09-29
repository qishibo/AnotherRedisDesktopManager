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
  /**
   * redis键数组分解为树形结构
   * 
   * @param {*} input 
   * @param {*} split 
   */
  keysToTree(keys) {
    function toTreeData(tree, path = '', init = true) {
      // 当前迭代的节点路径
      let currentIteratePath = path

      return Object.keys(tree).map(function (label) {
        var o = { label: label, redis: false };

        if (init) {
          path = label
          currentIteratePath = path
        } else if (Object.keys(tree).length > 1) {
          currentIteratePath = path + ':' + label
        } else {
          path = path + ':' + label
          currentIteratePath = path
        }

        if (Object.keys(tree[label]).length > 0) {
          o.children = toTreeData(tree[label], path, false);
        } else {
          o.label = currentIteratePath
          o.redis = true
        }

        return o;
      });
    }
    // array 转换成 tree object
    var tree = {};
    keys.forEach(function (key) {
      var currentNode = tree;
      key.split(':').forEach(function (segment) {
        if (currentNode[segment] === undefined) {
          currentNode[segment] = {};
        }
        currentNode = currentNode[segment];
      });
    });

    return toTreeData(tree)
  }
};
