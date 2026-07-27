import utils from './util';

const { randomString } = utils;

export default {
  createGroupId() {
    return `${Date.now()}_${randomString(5)}`;
  },
  normalizeGroups(groups = []) {
    return groups.map((group) => {
      if (typeof group === 'string') {
        return { id: this.createGroupId(), name: group.trim() };
      }

      return {
        id: group.id || this.createGroupId(),
        name: (group.name || '').trim(),
      };
    }).filter(group => group.name);
  },
  getGroups() {
    const raw = localStorage.getItem('connection_groups');

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const groups = this.normalizeGroups(parsed);

    // migrate legacy string / missing-id format
    if (parsed.some(group => typeof group === 'string' || !group.id)) {
      this.setGroups(groups);
    }

    return groups;
  },
  setGroups(groups) {
    localStorage.setItem('connection_groups', JSON.stringify(this.normalizeGroups(groups)));
  },
  addGroup(name) {
    name = (name || '').trim();
    const groups = this.getGroups();

    if (!name || groups.some(group => group.name === name)) {
      return false;
    }

    const group = { id: this.createGroupId(), name };
    groups.push(group);
    this.setGroups(groups);

    return group;
  },
  renameGroup(id, name) {
    name = (name || '').trim();
    const groups = this.getGroups();
    const target = groups.find(group => group.id === id);

    if (!id || !name || !target) {
      return false;
    }

    if (target.name === name) {
      return true;
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
    let changed = false;

    Object.keys(connections).forEach((key) => {
      if (connections[key].groupId === id) {
        connections[key].groupId = null;
        changed = true;
      }
    });

    if (changed) {
      this.setConnections(connections);
    }

    return true;
  },
  sanitizeConnectionGroupId(connection) {
    if (!connection.groupId) {
      connection.groupId = null;
      return;
    }

    if (!this.getGroups().some(group => group.id === connection.groupId)) {
      connection.groupId = null;
    }
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
    this.sanitizeConnectionGroupId(connection);
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
  getStorageKeyMap(type) {
    const typeMap = {
      cli_tip: 'cliTips',
      last_db: 'lastSelectedDb',
      custom_db: 'customDbName',
      search_tip: 'searchTips',
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
