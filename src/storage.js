export default {
  getSetting(key) {
    let settings = localStorage.getItem('settings');
    settings = settings ? JSON.parse(settings) : {};

    return key ? settings[key] : settings;
  },

  addConnection(connection) {
    const connections = this.getConnections();
    const key = this.getConnectionKey(connection);

    if (connections[key]) {
      return false;
    }

    connections[key] = connection;
    this.setConnections(connections);
  },

  getConnections(returnList = false) {
    let connections = localStorage.connections || '{}';

    connections = JSON.parse(connections);
    connections = this.sortByKey(connections);

    if (returnList) {
      connections = Object.keys(connections).map(key => connections[key]);
    }

    return connections;
  },
  editConnection(oldConnection, newConnection) {
    const connections = this.getConnections();
    const oldKey = this.getConnectionKey(oldConnection);

    if (!connections[oldKey]) {
      return false;
    }

    delete connections[oldKey];

    const newKey = this.getConnectionKey(newConnection);

    connections[newKey] = newConnection;
    this.setConnections(connections);
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
  getConnectionKey(connection) {
    return connection.host + connection.port + connection.name;
  },
  sortByKey(obj) {
    return Object.keys(obj).sort()
      .reduce((acc, c) => { acc[c] = obj[c]; return acc; }, {});
  },
};
