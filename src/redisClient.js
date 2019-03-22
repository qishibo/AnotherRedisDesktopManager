import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth, menuIndex = 0) {
    const options = {
      retry_strategy(options) {
        console.log(options);
        alert(options.error);
      },
      menu_index: menuIndex,
    };

    const client = redis.createClient(port, host, options);

    return client;
  },
};
