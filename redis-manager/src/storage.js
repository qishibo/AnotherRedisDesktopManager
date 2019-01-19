export default {
  addConnection (connection) {
    let connections = this.getConnections();
    connections.push(connection);

    this.setConnections(connections);
  },

  getConnections () {
    let connections = localStorage.connections || '[]';
    connections = JSON.parse(connections);

    return connections;
  },
  setConnections(connections) {
    localStorage.connections = JSON.stringify(connections);
  },
  deleteConnection(connection) {
    let host = connection.host;
    let port = connection.port;
    let auth = connection.auth;
    let name = connection.name;

    let connections = this.getConnections();

    for (var i in connections) {
      let item = connections[i];

      if (
        item.host === connection.host &&
        item.port === connection.port &&
        item.auth === connection.auth &&
        item.name === connection.name
        ) {
        connections.splice(i, 1);
      }
    }

    this.setConnections(connections);

    return connections;
  }
}
