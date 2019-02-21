export default {
  addConnection (connection) {
    let connections = this.getConnections();
    let key = this.getConnectionKey(connection);

    if (connections[key]) {
      return false;
    }

    connections[key] = connection;
    this.setConnections(connections);
  },

  getConnections (returnList = false) {
    let connections = localStorage.connections || '{}';

    connections = JSON.parse(connections);

    if (returnList) {
      connections = Object.keys(connections).map(function(key) {
        return connections[key];
      });
    }

    return connections;
  },
  editConnection(oldConnection, newConnection) {
    let connections = this.getConnections();
    let oldKey = this.getConnectionKey(oldConnection);

    if (!connections[oldKey]) {
      return false;
    }

    delete connections[oldKey];

    let newKey = this.getConnectionKey(newConnection);

    connections[newKey] = newConnection;
    this.setConnections(connections);
  },
  setConnections(connections) {
    localStorage.connections = JSON.stringify(connections);
  },
  deleteConnection(connection) {
    let connections = this.getConnections();
    let key = this.getConnectionKey(connection);

    delete connections[key];

    this.setConnections(connections);
  },
  getConnectionKey(connection) {
    return connection.host + connection.port + connection.name;
  },
}
