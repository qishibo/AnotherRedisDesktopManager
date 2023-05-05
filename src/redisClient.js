import Redis from '@qii404/ioredis';
import {createTunnel} from 'tunnel-ssh';
import vue from '@/main.js';
import {remote} from 'electron';
import {writeCMD} from '@/commands.js';

const fs = require('fs');
const { sendCommand } = Redis.prototype;

// redis command log
Redis.prototype.sendCommand = function (...options) {
  const command = options[0];

  // readonly mode
  if (this.options.connectionReadOnly && writeCMD[command.name.toUpperCase()]) {
    command.reject(new Error("You are in readonly mode! Unable to execute write command!"));
    return command.promise;
  }

  // exec directly, without logs
  if (this.withoutLogging === true) {
    // invalid in next calling
    this.withoutLogging = false;
    return sendCommand.apply(this, options);
  }

  const start = performance.now();
  const response = sendCommand.apply(this, options);
  const cost = performance.now() - start;

  const record = {time: new Date(), connectionName: this.options.connectionName, command: command, cost: cost};
  vue.$bus.$emit('commandLog', record);

  return response;
};

// fix ioredis hgetall key has been toString()
Redis.Command.setReplyTransformer("hgetall", (result) => {
  let arr = [];
  for (let i = 0; i < result.length; i += 2) {
    arr.push([result[i], result[i + 1]]);
  }

  return arr;
});


export default {
  createConnection(host, port, auth, config, promise = true, forceStandalone = false, removeDb = false) {
    let options = this.getRedisOptions(host, port, auth, config);
    let client = null;

    if (removeDb) {
      delete options.db;
    }

    if (forceStandalone) {
      client = new Redis(options);
    }

    // sentinel redis
    else if (config.sentinelOptions) {
      const sentinelOptions = this.getSentinelOptions(host, port, auth, config);
      client = new Redis(sentinelOptions);
    }

    // cluster redis
    else if (config.cluster) {
      const clusterOptions = this.getClusterOptions(options, config.natMap ? config.natMap : {});
      client = new Redis.Cluster([{port, host}], clusterOptions)
    }

    // standalone redis
    else {
      client = new Redis(options);
    }

    if (promise) {
      return new Promise((resolve, reject) => {
        resolve(client);
      });
    }

    return client;
  },

  createSSHConnection(sshOptions, host, port, auth, config) {
    const sshOptionsDict = this.getSSHOptions(sshOptions, host, port);

    const configRaw = JSON.parse(JSON.stringify(config));
    const sshConfigRaw = JSON.parse(JSON.stringify(sshOptionsDict));

    const sshPromise = new Promise((resolve, reject) => {
      createTunnel(...Object.values(sshOptionsDict)).then(([server, connection]) => {
        const listenAddress = server.address();

        // sentinel mode
        if (configRaw.sentinelOptions) {
          // this is a sentinel connection, remove db
          let client = this.createConnection(listenAddress.address, listenAddress.port, auth, configRaw, false, true, true);

          client.on('ready', () => {
            client.call('sentinel', 'get-master-addr-by-name', configRaw.sentinelOptions.masterName).then(reply => {
              if (!reply) {
                return reject(new Error(`Master name "${configRaw.sentinelOptions.masterName}" not exists!`));
              }

              // connect to the master node via ssh
              this.createClusterSSHTunnels(sshConfigRaw, [{host: reply[0], port: reply[1]}]).then(tunnels => {
                const sentinelClient = this.createConnection(
                  tunnels[0].localHost, tunnels[0].localPort, configRaw.sentinelOptions.nodePassword, configRaw, false, true);

                return resolve(sentinelClient);
              });
            }).catch(e => {reject(e);}); // sentinel exec failed
          });

          client.on('error', e => {reject(e);});
        }

        // ssh cluster mode
        else if (configRaw.cluster) {
          let client = this.createConnection(listenAddress.address, listenAddress.port, auth, configRaw, false, true);

          client.on('ready', () => {
            // get all cluster nodes info
            client.call('cluster', 'nodes').then(reply => {
              let nodes = this.getClusterNodes(reply);

              // create ssh tunnel for each node
              this.createClusterSSHTunnels(sshConfigRaw, nodes).then((tunnels) => {
                configRaw.natMap = this.initNatMap(tunnels);

                // select first line of tunnels to connect
                const clusterClient = this.createConnection(tunnels[0].localHost, tunnels[0].localPort, auth, configRaw, false);

                resolve(clusterClient);
              });
            }).catch(e => {reject(e);});

          });

          client.on('error', e => {reject(e);});
        }

        // ssh standalone redis
        else {
          let client = this.createConnection(listenAddress.address, listenAddress.port, auth, configRaw, false);
          return resolve(client);
        }

      // create SSH tunnel failed
      }).catch(e => {
        // vue.$message.error('SSH errror: ' + e.message);
        // vue.$bus.$emit('closeConnection');
        reject(e);
      });
    });

    return sshPromise;
  },

  getSSHOptions(options, host, port) {
    const tunnelOptions = {
      autoClose: false,
    };
    // where your localTCP Server is listening
    const serverOptions = {
      host: '127.0.0.1',
      port: 0,
    };
    // ssh server
    const sshOptions = {
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      privateKey: this.getFileContent(options.privatekey, options.privatekeybookmark),
      passphrase: options.passphrase ? options.passphrase : undefined,
      readyTimeout: (options.timeout) > 0 ? (options.timeout * 1000) : 30000,
      keepaliveInterval: 10000,
    };
    // forward link in ssh server
    const forwardOptions = {
      srcAddr: '127.0.0.1',
      srcPort: 0,
      dstAddr: host,
      dstPort: port
    };

    // Tips: small dict is ordered, should replace to Map if dict is large
    return { tunnelOptions, serverOptions, sshOptions, forwardOptions };
  },

  getRedisOptions(host, port, auth, config) {
    return {
      // add additional host+port to options for "::1"
      host: host,
      port: port,
      family: 0,

      connectTimeout: 30000,
      retryStrategy: (times) => {return this.retryStragety(times, {host, port})},
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : null,
      password: auth,
      db: config.db ? config.db : undefined,
      // ACL support
      username: config.username ? config.username : undefined,
      tls: config.sslOptions ? this.getTLSOptions(config.sslOptions) : undefined,
      connectionReadOnly: config.connectionReadOnly ? true : undefined,
      // return int as string to avoid big number issues
      stringNumbers: true,
    };
  },

  getSentinelOptions(host, port, auth, config) {
    return {
      sentinels: [{host: host, port: port}],
      sentinelPassword: auth,
      password: config.sentinelOptions.nodePassword,
      name: config.sentinelOptions.masterName,
      connectTimeout: 30000,
      retryStrategy: (times) => {return this.retryStragety(times, {host, port})},
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : null,
      db: config.db ? config.db : undefined,
      // ACL support
      username: config.username ? config.username : undefined,
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
      if (sshConfigCopy.sshOptions.privateKey) {
        sshConfigCopy.sshOptions.privateKey = Buffer.from(sshConfigCopy.sshOptions.privateKey)
      }

      sshConfigCopy.forwardOptions.dstHost = node.host;
      sshConfigCopy.forwardOptions.dstPort = node.port;

      let promise = new Promise((resolve, reject) => {
        const sshPromise = createTunnel(...Object.values(sshConfigCopy));
        sshPromise.then(([server, connection]) => {
          let addr = server.address();
          let line = {
            localHost: addr.address, localPort: addr.port,
            dstHost: node.host, dstPort: node.port
          };

          resolve(line);
        }).catch(e => {
          reject(e);
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
      // ca: options.ca ? fs.readFileSync(options.ca) : '',
      // key: options.key ? fs.readFileSync(options.key) : '',
      // cert: options.cert ? fs.readFileSync(options.cert) : '',
      ca: this.getFileContent(options.ca, options.cabookmark),
      key: this.getFileContent(options.key, options.keybookmark),
      cert: this.getFileContent(options.cert, options.certbookmark),

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

  getFileContent(file, bookmark = '') {
    if (!file) {
      return undefined;
    }

    try {
      // mac app store version, read through bookmark
      if (bookmark) {
        const bookmarkClose = remote.app.startAccessingSecurityScopedResource(bookmark);
      }

      const content = fs.readFileSync(file);
      (typeof bookmarkClose == 'function') && bookmarkClose();

      return content;
    }
    catch (e) {
      // force alert
      alert(vue.$t('message.key_no_permission') + `\n[${e.message}]`);
      vue.$bus.$emit('closeConnection');

      return undefined;
    }
  },
};

