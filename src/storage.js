export default {
  getSetting(key) {
    let settings = localStorage.getItem('settings');
    settings = settings ? JSON.parse(settings) : {};

    return key ? settings[key] : settings;
  },
  saveSettings(settings) {
    settings = JSON.stringify(settings);
    return localStorage.setItem('settings', settings);
  },
  getCustomFormatter(name = '') {
    let formatters = localStorage.getItem('customFormatters');
    formatters = formatters ? JSON.parse(formatters) : [];

    if (!name) {
      return formatters;
    }

    for (let line of formatters) {
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
      connection.order = Object.keys(connections).length;
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

    for (let key in connections) {
      // if 'name' same with others, add random suffix
      if (this.getConnectionName(connections[key]) == name) {
        name += ` (${Math.random().toString(36).substr(-3)})`;
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
      return new Date().getTime() + '_' + Math.random().toString(36).substr(-5);
    }

    return connection.host + connection.port + connection.name;
  },
  sortConnections(connections) {
    connections.sort(function(a, b) {
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
    let newConnections = {};

    for (const index in connections) {
      let connection = connections[index];
      connection.order = index;
      newConnections[this.getConnectionKey(connection, true)] = connection;
    }

    this.setConnections(newConnections);

    return newConnections;
  },
};
