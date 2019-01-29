import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth) {
    console.log(host, port, auth, redis);

    var options = {retry_strategy: function (options) {
        console.log(options);
        alert(options.error);
    }};
    var client = redis.createClient(port, host, options);

    client.on("error", function (err) {
        alert(err);
        return false;
    });

    return client;
  }
}
