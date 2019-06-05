import redis from 'redis';
import bluebird from 'bluebird';
import tunnelssh from 'tunnel-ssh';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth, menuIndex = null) {
    const options = {
      connect_timeout: 2000,
      // max_attempts: 3,
      retry_strategy: (options) => {return this.retryStragety(options, {host: host, port: port})},
      no_ready_check: true,
      menu_index: menuIndex,
      password: auth,
    };

    const client = redis.createClient(port, host, options);

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, menuIndex = null) {
    const options = {
      retry_strategy: (options) => {return this.retryStragety(options, {host: host, port: port})},
      no_ready_check: true,
      menu_index: menuIndex,
      password: auth,
    };

    const config = {
      username: sshOptions.username,
      password: sshOptions.password,
      host: sshOptions.host,
      port: sshOptions.port,
      dstHost: host,
      dstPort: port,
      localHost: '127.0.0.1',
      localPort: null,
    };

    const sshPromise = new bluebird((resolve, reject) => {
      tunnelssh(config, function (error, server) {
        const listenAddress = server.address();
        console.log('ssh tunnel listening in', listenAddress);

        server.on('error', (error) => {
          alert('SSH Connection Error: ' + error.message);
          reject(error);
        });

        const client = redis.createClient(listenAddress.port, listenAddress.address, options);

        if (error) {
          reject(error);
        }
        else {
          resolve(client);
        }
      });
    });

    return sshPromise;
  },

  retryStragety(options, connection) {
    console.log('retrying...', options, connection);
    const maxRetryTimes = 3;

    if (options.attempt >= maxRetryTimes) {
      alert(`${connection.host}:${connection.port}\nToo Many Attempts To Reconnect. Please Check The Server Status!`);
      return false;
    }

    // reconnect after
    return Math.max(options.attempt * 200, 1000);
  },
};
