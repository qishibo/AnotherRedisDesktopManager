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
  redisKeysTree(keys) {
    /**
     * 转成object
      {
        "a": {
          "b": {
            "d": {}
          },
          "c": {}
        }
      } 
     */
    function toTreeData(tree) {
      return Object.keys(tree).map(function (label) {
        var o = { label: label, redis: false };

        if (Object.keys(tree[label]).length > 0) {
          o.children = toTreeData(tree[label]);
        } else {
          o.label = label
          o.redis = true
        }

        return o;
      });
    }
    /**
     * object 转成 tree
      [
        {
          "label": "a",
          "redis": false,
          "children": [
            {
              "label": "b",
              "redis": false,
              "children": [
                {
                  "label": "d"",
                  "redis": true
                }
              ]
            },
            {
              "label": "c",
              "redis": true
            }
          ]
        }
      ]
     */
    function keysToTree(keys) {
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

    /**
     * 格式化 tree 最后节点
      [
        {
          "label": "a",
          "redis": false,
          "children": [
            {
              "label": "b",
              "redis": false,
              "children": [
                {
                  "label": "a:b:d"",
                  "redis": true
                }
              ]
            },
            {
              "label": "a:c",
              "redis": true
            }
          ]
        }
      ]
     */
    function formatTree(tree, stack = []) {
      if (!tree) return
      for (let data of tree) {
        stack.push(data.label)
        if (data.children && data.children.length) {
          formatTree(data.children, stack)
        } else {
          data.label = stack.join(':')
        }
        stack.pop(data.label)
      }
      return tree
    }

    return formatTree(keysToTree(keys))
  }
};
