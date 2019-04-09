import redis from 'redis';
import bluebird from 'bluebird';
import tunnelssh from 'tunnel-ssh';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth, menuIndex = 0) {
    const options = {
      retry_strategy(options) {
        console.log(options);
        alert(options.error);
      },
      menu_index: menuIndex,
      password: auth,
    };

    const client = redis.createClient(port, host, options);

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, menuIndex = 0) {
    const options = {
      retry_strategy(options) {
        console.log(options);
        alert(options.error);
      },
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
          alert(error.message);
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
};
