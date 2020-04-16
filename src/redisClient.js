import Redis from 'ioredis';
import tunnelssh from 'tunnel-ssh';

// fix ioredis hgetall key has been toString()
Redis.Command.setReplyTransformer("hgetall", (result) => {
  let arr = [];
  for (let i = 0; i < result.length; i += 2) {
    arr.push([result[i], result[i + 1]]);
  }

  return arr;
});

export default {
  createConnection(host, port, auth, config) {
    const options = {
      connectTimeout: 3000,
      retryStrategy: (times) => {return this.retryStragety(times, {host, port})},
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : null,
      password: auth,
    };

    const clusterOptions = {
      connectionName: options.connectionName,
      enableReadyCheck: false,
      redisOptions: options,
    };

    const client = config.cluster ?
                    new Redis.Cluster([{port, host}], clusterOptions) :
                    new Redis(port, host, options);

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, config) {
    const options = {
      connectTimeout: 3000,
      retryStrategy: (times) => {return this.retryStragety(times, {host, port})},
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : null,
      password: auth,
    };

    const clusterOptions = {
      connectionName: options.connectionName,
      enableReadyCheck: false,
      redisOptions: options,
    };

    const sshConfig = {
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

    const sshPromise = new Promise((resolve, reject) => {
      var server = tunnelssh(sshConfig, function (error, server) {
        if (error) {
          reject(error);
        }
        else {
          const listenAddress = server.address();
          const client = config.cluster ?
                          new Redis.Cluster([{port: listenAddress.port, host: listenAddress.address}], clusterOptions) :
                          new Redis(listenAddress.port, listenAddress.address, options);
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
