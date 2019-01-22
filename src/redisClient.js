import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth) {
    console.log(host, port, auth, redis);

    var client = redis.createClient(port, host);

    client.on("error", function (err) {
        alert(err);
        return false;
    });

    return client;
  }
}
