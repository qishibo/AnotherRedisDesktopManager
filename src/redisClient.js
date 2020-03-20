import Redis from 'ioredis';
import bluebird from 'bluebird';
import tunnelssh from 'tunnel-ssh';

export default {
  createConnection(host, port, auth, connectionName = null) {
    const options = {
      connect_timeout: 2000,
      retry_strategy: (times) => {return this.retryStragety(times, {host, port})},
      no_ready_check: true,
      connectionName: connectionName,
      password: auth,
    };

    const client = new Redis(port, host, options);

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, connectionName = null) {
    const options = {
      connect_timeout: 2000,
      retry_strategy: (times) => {return this.retryStragety(times, {host, port})},
      no_ready_check: true,
      connectionName: connectionName,
      password: auth,
    };

    const config = {
      username: sshOptions.username,
      password: sshOptions.password,
      host: sshOptions.host,
      port: sshOptions.port,
      readyTimeout: 2000,
      dstHost: host,
      dstPort: port,
      localHost: '127.0.0.1',
      localPort: null,
      privateKey: sshOptions.privatekey ?
                  require('fs').readFileSync(sshOptions.privatekey) : '',
    };

    const sshPromise = new bluebird((resolve, reject) => {
      var server = tunnelssh(config, function (error, server) {
        if (error) {
          reject(error);
        }
        else {
          const listenAddress = server.address();
          const client = new Redis(listenAddress.port, listenAddress.address, options);
          resolve(client);
        }
      });

      server.on('error', (error) => {
        alert('SSH Connection Error: ' + error.message);
        reject(error);
      });
    });

    return sshPromise;
  },

  retryStragety(times, connection) {
    const maxRetryTimes = 3;

    if (times >= maxRetryTimes) {
      alert(`${connection.host}:${connection.port}\nToo Many Attempts To Reconnect. Please Check The Server Status!`);
      return false;
    }

    // reconnect after
    return Math.min(times * 200, 1000);
  },
};
