import redis from 'redis';
import bluebird from 'bluebird';
import tunnelssh from 'tunnel-ssh';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth, connectionName = null) {
    const options = {
      connect_timeout: 2000,
      // max_attempts: 3,
      retry_strategy: (options) => {return this.retryStragety(options, {host: host, port: port})},
      no_ready_check: true,
      connection_name: connectionName,
      password: auth,
    };

    const client = redis.createClient(port, host, options);

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, connectionName = null) {
    const options = {
      retry_strategy: (options) => {return this.retryStragety(options, {host: host, port: port})},
      no_ready_check: true,
      connection_name: connectionName,
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
          const client = redis.createClient(listenAddress.port, listenAddress.address, options);
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

  retryStragety(options, connection) {
    const maxRetryTimes = 3;

    if (options.attempt >= maxRetryTimes) {
      alert(`${connection.host}:${connection.port}\nToo Many Attempts To Reconnect. Please Check The Server Status!`);
      return false;
    }

    // reconnect after
    return Math.max(options.attempt * 200, 1000);
  },
};
