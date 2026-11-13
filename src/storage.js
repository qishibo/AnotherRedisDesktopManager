import utils from './util';

const { randomString } = utils;

export default {
  createUniqId() {
    return `${Date.now()}_${randomString(5)}`;
  },
  getGroups() {
    const raw = localStorage.getItem(this.getStorageKeyMap('connection_groups'));

    return raw ? JSON.parse(raw) : [];
  },
  setGroups(groups) {
    localStorage.setItem(this.getStorageKeyMap('connection_groups'), JSON.stringify(groups));
  },
  addGroup(name) {
    const groups = this.getGroups();

    // already exists
    if (groups.some(group => group.name === name)) {
      return false;
    }

    const group = { id: this.createUniqId(), name };
    groups.push(group);
    this.setGroups(groups);

    return group;
  },
  renameGroup(id, name) {
    const groups = this.getGroups();
    const target = groups.find(group => group.id === id);

    if (!id || !name || !target) {
      return false;
    }

    if (groups.some(group => group.name === name)) {
      return false;
    }

    target.name = name;
    this.setGroups(groups);

    return true;
  },
  deleteGroup(id) {
    if (!id) {
      return false;
    }

    this.setGroups(this.getGroups().filter(group => group.id !== id));

    const connections = this.getConnections();

    // delete group info in connections
    Object.keys(connections).forEach((key) => {
      if (connections[key].groupId === id) {
        connections[key].groupId = null;
      }
    });

    this.setConnections(connections);
    return true;
  },
  getSetting(key) {
    let settings = localStorage.getItem('settings');
    settings = settings ? JSON.parse(settings) : {};

    return key ? settings[key] : settings;
  },
  saveSettings(settings) {
    settings = JSON.stringify(settings);
    return localStorage.setItem('settings', settings);
  },
  getFontFamily() {
    let fontFamily = this.getSetting('fontFamily');

    // set to default font-family
    if (
      !fontFamily || !fontFamily.length
      || fontFamily.toString() === 'Default Initial'
    ) {
      fontFamily = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica',
        'Arial', 'sans-serif', 'Microsoft YaHei', 'Apple Color Emoji', 'Segoe UI Emoji'];
    }

    return fontFamily.map(line => `"${line}"`).join(',');
  },
  getCustomFormatter(name = '') {
    let formatters = localStorage.getItem('customFormatters');
    formatters = formatters ? JSON.parse(formatters) : [];

    if (!name) {
      return formatters;
    }

    for (const line of formatters) {
      if (line.name === name) {
        return line;
      }
    }
  },
  saveCustomFormatters(formatters = []) {
    return localStorage.setItem('customFormatters', JSON.stringify(formatters));
  },
  getProtobufStore() {
    const raw = localStorage.getItem('protobufStore');
    return raw ? JSON.parse(raw) : { profiles: {}, bindings: {} };
  },
  saveProtobufStore(store) {
    localStorage.setItem('protobufStore', JSON.stringify(store));
  },
  findProtobufProfileIdByPaths(store, paths = []) {
    const pathsKey = JSON.stringify(paths);

    return Object.keys(store.profiles).find(
      id => JSON.stringify(store.profiles[id].paths) === pathsKey,
    ) || null;
  },
  getProtobufProfileByRedisKey(redisKeyHex) {
    if (!redisKeyHex) {
      return null;
    }

    const store = this.getProtobufStore();
    const binding = store.bindings[redisKeyHex];

    return binding ? store.profiles[binding.pid] : null;
  },
  bindProtobufProfile(redisKeyHex, profile = {}) {
    if (!redisKeyHex || !profile.paths || !profile.paths.length) {
      return null;
    }

    const store = this.getProtobufStore();
    let profileId = this.findProtobufProfileIdByPaths(store, profile.paths);

    // new profile
    if (!profileId) {
      profileId = this.createUniqId();
      store.profiles[profileId] = {
        id: profileId,
        name: profile.name || '',
        paths: profile.paths,
        bookmarks: profile.bookmarks || [],
      };
    }
    // exists profile, path & name not changed, update bookmark
    else {
      store.profiles[profileId].bookmarks = profile.bookmarks || [];
    }

    store.bindings[redisKeyHex] = { pid: profileId };
    this.saveProtobufStore(store);

    return store.profiles[profileId];
  },
  unbindProtobufProfile(redisKeyHex) {
    if (!redisKeyHex) {
      return;
    }

    const store = this.getProtobufStore();
    delete store.bindings[redisKeyHex];
    this.saveProtobufStore(store);
  },
  addConnection(connection) {
    this.editConnectionByKey(connection, '');
  },
  getConnections(returnList = false) {
    let connections = localStorage.connections || '{}';

    connections = JSON.parse(connections);

    if (returnList) {
      connections = Object.keys(connections).map(key => connections[key]);
      this.sortConnections(connections);
    }

    return connections;
  },
  editConnectionByKey(connection, oldKey = '') {
    oldKey = connection.key || oldKey;

    const connections = this.getConnections();
    delete connections[oldKey];

    this.updateConnectionName(connection, connections);
    const newKey = this.getConnectionKey(connection, true);
    connection.key = newKey;

    // new added has no order, add it. do not add when edit mode
    if (!oldKey && isNaN(connection.order)) {
      // connection.order = Object.keys(connections).length;
      const maxOrder = Math.max(...Object.values(connections).map(item => (!isNaN(item.order) ? item.order : 0)));
      connection.order = (maxOrder > 0 ? maxOrder : 0) + 1;
    }

    connections[newKey] = connection;
    this.setConnections(connections);
  },
  editConnectionItem(connection, items = {}) {
    const key = this.getConnectionKey(connection);
    const connections = this.getConnections();

    if (!connections[key]) {
      return;
    }

    Object.assign(connection, items);
    Object.assign(connections[key], items);
    this.setConnections(connections);
  },
  updateConnectionName(connection, connections) {
    let name = this.getConnectionName(connection);

    for (const key in connections) {
      // if 'name' same with others, add random suffix
      if (this.getConnectionName(connections[key]) == name) {
        name += ` (${randomString(3)})`;
        break;
      }
    }

    connection.name = name;
  },
  getConnectionName(connection) {
    return connection.name || `${connection.host}@${connection.port}`;
  },
  setConnections(connections) {
    localStorage.connections = JSON.stringify(connections);
  },
  deleteConnection(connection) {
    const connections = this.getConnections();
    const key = this.getConnectionKey(connection);

    delete connections[key];

    this.hookAfterDelConnection(connection);
    this.setConnections(connections);
  },
  getConnectionKey(connection, forceUnique = false) {
    if (Object.keys(connection).length === 0) {
      return '';
    }

    if (connection.key) {
      return connection.key;
    }

    if (forceUnique) {
      return `${new Date().getTime()}_${randomString(5)}`;
    }

    return connection.host + connection.port + connection.name;
  },
  sortConnections(connections) {
    connections.sort((a, b) => {
      // drag ordered
      if (!isNaN(a.order) && !isNaN(b.order)) {
        return parseInt(a.order) <= parseInt(b.order) ? -1 : 1;
      }

      // no ordered, by key
      if (a.key && b.key) {
        return a.key < b.key ? -1 : 1;
      }

      return a.key ? 1 : (b.key ? -1 : 0);
    });
  },
  reOrderAndStore(connections = []) {
    const newConnections = {};

    for (const index in connections) {
      const connection = connections[index];
      connection.order = parseInt(index);
      newConnections[this.getConnectionKey(connection, true)] = connection;
    }

    this.setConnections(newConnections);

    return newConnections;
  },
  exportConnectionsBundle() {
    return {
      connections: this.getConnections(true),
      groups: this.getGroups(),
    };
  },
  importConnectionsBundle(config) {
    let connections = [];
    let groups = [];

    // legacy: plain connection list
    if (Array.isArray(config)) {
      connections = config;
    }
    // new type, {connections: [], groups: []}
    else if (config && typeof config === 'object') {
      connections = Array.isArray(config.connections) ? config.connections : [];
      groups = Array.isArray(config.groups) ? config.groups : [];
    }

    const groupIds = new Set(groups.map(group => group.id).filter(Boolean));

    this.setGroups(groups.filter(group => group.id && group.name));
    this.setConnections({});

    connections.forEach((conn) => {
      const item = { ...conn };
      delete item.key;
      delete item.db;
      item.groupId = item.groupId && groupIds.has(item.groupId) ? item.groupId : null;
      this.addConnection(item);
    });
  },

  /**
   * 导出所有连接配置为标准 JSON（servers 格式）
   * @returns {string} JSON 字符串
   */
  exportConnections() {
    const list = this.getConnections(true);
    const servers = list.map((conn) => {
      const item = { ...conn };
      delete item.key;
      delete item.db;
      delete item.connectionName;
      return item;
    });

    return JSON.stringify({
      version: '1.0',
      exportTime: new Date().toISOString(),
      servers,
    }, null, 2);
  },

  /**
   * 校验连接配置数组，返回 { valid, errors, validServers }
   * @param {Array} servers
   */
  validateServers(servers) {
    const errors = [];
    const validServers = [];

    if (!Array.isArray(servers)) {
      return { valid: false, errors: ['servers 必须是数组'], validServers };
    }

    servers.forEach((s, idx) => {
      const prefix = `第 ${idx + 1} 条连接`;

      if (!s || typeof s !== 'object') {
        errors.push(`${prefix}: 不是有效的对象`);
        return;
      }

      if (s.host === undefined || s.host === null || s.host === '') {
        errors.push(`${prefix}: host 不能为空`);
        return;
      }
      if (typeof s.host !== 'string') {
        errors.push(`${prefix}: host 必须是字符串`);
        return;
      }

      const port = Number(s.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push(`${prefix}: port 必须是 1-65535 之间的数字`);
        return;
      }

      validServers.push({ ...s, port });
    });

    return { valid: errors.length === 0, errors, validServers };
  },

  /**
   * 导入连接配置（追加模式，不替换）
   * @param {Array} servers 已校验的连接数组
   * @param {'overwrite'|'skip'} conflictMode 冲突处理方式
   * @returns {{added: number, skipped: number, overwritten: number}}
   */
  importConnections(servers, conflictMode = 'skip') {
    const existing = this.getConnections(true);
    const existingMap = new Map();
    existing.forEach((conn) => {
      const key = this.getConnectionKey(conn);
      existingMap.set(key, conn);
    });

    let added = 0;
    let skipped = 0;
    let overwritten = 0;

    servers.forEach((srv) => {
      const newConn = { ...srv };
      delete newConn.key;
      delete newConn.db;

      const newKey = this.getConnectionKey(newConn);

      if (existingMap.has(newKey)) {
        if (conflictMode === 'overwrite') {
          // 覆盖：删除旧的再添加新的
          const all = this.getConnections();
          delete all[newKey];
          this.setConnections(all);
          this.addConnection(newConn);
          overwritten++;
        } else {
          // 跳过
          skipped++;
        }
      } else {
        this.addConnection(newConn);
        added++;
      }
    });

    return { added, skipped, overwritten };
  },
  getStorageKeyMap(type) {
    const typeMap = {
      cli_tip: 'cliTips',
      last_db: 'lastSelectedDb',
      custom_db: 'customDbName',
      search_tip: 'searchTips',
      connection_groups: 'connectionGroups',
    };

    return type ? typeMap[type] : typeMap;
  },
  initStorageKey(prefix, connectionName) {
    return `${prefix}_${connectionName}`;
  },
  getStorageKeyByName(type = 'cli_tip', connectionName = '') {
    return this.initStorageKey(this.getStorageKeyMap(type), connectionName);
  },
  hookAfterDelConnection(connection) {
    const connectionName = this.getConnectionName(connection);
    const types = Object.keys(this.getStorageKeyMap());

    const willRemovedKeys = [];

    for (const type of types) {
      willRemovedKeys.push(this.getStorageKeyByName(type, connectionName));
    }

    willRemovedKeys.forEach(k => localStorage.removeItem(k));
  },
};
