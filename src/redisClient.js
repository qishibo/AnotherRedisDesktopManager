import Redis from 'ioredis';
import tunnelssh from 'tunnel-ssh';
import vue from '@/main.js';
const fs = require('fs');


export default {
  createConnection(host, port, auth, config, promise = true) {
    const options = this.getRedisOptions(host, port, auth, config);

    // standalone redis
    if (!config.cluster) {
      var client = new Redis(port, host, options);
    }
    // cluster redis
    else {
      const clusterOptions = this.getClusterOptions(options, config.natMap ? config.natMap : {});
      var client = new Redis.Cluster([{port, host}], clusterOptions)
    }

    if (promise) {
      return new Promise((resolve, reject) => {
        resolve(client);
      });
    }

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, config) {
    const sshConfig = {
      username: sshOptions.username,
      password: sshOptions.password,
      host: sshOptions.host,
      port: sshOptions.port,
      readyTimeout: (sshOptions.timeout) > 0 ? (sshOptions.timeout * 1000) : 30000,
      dstHost: host,
      dstPort: port,
      localHost: '127.0.0.1',
      localPort: null, // set null to use available port in local machine
      privateKey: sshOptions.privatekey ?
                  fs.readFileSync(sshOptions.privatekey) : undefined,
      passphrase: sshOptions.passphrase ? sshOptions.passphrase : undefined,
      keepaliveInterval: 10000,
    };

    const sshConfigRaw = JSON.parse(JSON.stringify(sshConfig));

    const sshPromise = new Promise((resolve, reject) => {
      var server = tunnelssh(sshConfig, (error, server) => {
        // ssh error only on this, not the 'error' argument...
        server.on('error', error => {
          vue.$message.error(error.message + ' SSH config right?');
          vue.$bus.$emit('closeConnection');
          // return reject(error);
        });

        if (error) {
          return reject(error);
        }

        const listenAddress = server.address();

        // ssh standalone redis
        if (!config.cluster) {
          let client = this.createConnection(listenAddress.address, listenAddress.port, auth, config, false);
          return resolve(client);
        }

        // ssh cluster mode
        const configRaw = JSON.parse(JSON.stringify(config));
        configRaw.cluster = false;

        // forerunner as a single client
        let client = this.createConnection(listenAddress.address, listenAddress.port, auth, configRaw, false);

        client.on('ready', () => {
          // get all cluster nodes info
          client.call('cluster', 'nodes', (error, reply) => {
            if (error) {
              return reject(error);
            }

            let nodes = this.getClusterNodes(reply);

            // create ssh tunnel for each node
            this.createClusterSSHTunnels(sshConfigRaw, nodes).then((tunnels) => {
              configRaw.cluster = true;
              configRaw.natMap = this.initNatMap(tunnels);

              // select first line of tunnels to connect
              const clusterClient = this.createConnection(tunnels[0].localHost, tunnels[0].localPort, auth, configRaw, false);

              resolve(clusterClient);
            });
          })
        });
      });
    });

    return sshPromise;
  },

  getRedisOptions(host, port, auth, config) {
    return {
      connectTimeout: 30000,
      retryStrategy: (times) => {return this.retryStragety(times, {host, port})},
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : null,
      password: auth,
      tls: config.sslOptions ? this.getTLSOptions(config.sslOptions) : undefined,
    };
  },

  getClusterOptions(redisOptions, natMap = {}) {
    return {
      connectionName: redisOptions.connectionName,
      enableReadyCheck: false,
      slotsRefreshTimeout: 30000,
      redisOptions: redisOptions,
      natMap: natMap,
    };
  },

  getClusterNodes(nodes, type = 'master') {
    let result = [];
    nodes = nodes.split("\n");

    for (let node of nodes) {
      if (!node) {
        continue;
      }

      node = node.trim().split(' ');

      if (node[2].includes(type)) {
        let dsn = node[1].split('@')[0];
        let lastIndex = dsn.lastIndexOf(':');

        let host = dsn.substr(0, lastIndex);
        let port = dsn.substr(lastIndex + 1);

        result.push({host: host, port: port})
      }
    }

    return result;
  },

  createClusterSSHTunnels(sshConfig, nodes) {
    let sshTunnelStack = [];

    for (let node of nodes) {
      // tunnelssh will change 'config' param, so just copy it
      let sshConfigCopy = JSON.parse(JSON.stringify(sshConfig));

      // revocery the buffer after json.parse
      sshConfigCopy.privateKey && (sshConfigCopy.privateKey = Buffer.from(sshConfigCopy.privateKey));

      sshConfigCopy.dstHost = node.host;
      sshConfigCopy.dstPort = node.port;

      let promise = new Promise((resolve, reject) => {
        tunnelssh(sshConfigCopy, (error, server) => {
          if (error) {
            return reject(error);
          }

          let addr = server.address();
          let line = {
            localHost: addr.address, localPort: addr.port,
            dstHost: node.host, dstPort: node.port
          };

          resolve(line);
        });
      });

      sshTunnelStack.push(promise);
    }

    return Promise.all(sshTunnelStack);
  },

  initNatMap(tunnels) {
    let natMap = {};

    for (let line of tunnels) {
      natMap[`${line.dstHost}:${line.dstPort}`] = {host: line.localHost, port: line.localPort};
    }

    return natMap;
  },

  getTLSOptions(options) {
    return {
      ca: options.ca ? fs.readFileSync(options.ca) : '',
      key: options.key ? fs.readFileSync(options.key) : '',
      cert: options.cert ? fs.readFileSync(options.cert) : '',

      checkServerIdentity: (servername, cert) => {
        // skip certificate hostname validation
        return undefined;
      },
      rejectUnauthorized: false,
    }
  },

  retryStragety(times, connection) {
    const maxRetryTimes = 3;

    if (times >= maxRetryTimes) {
      vue.$message.error("Too Many Attempts To Reconnect. Please Check The Server Status!");
      vue.$bus.$emit('closeConnection');
      return false;
    }

    // reconnect after
    return Math.min(times * 200, 1000);
  },
};
