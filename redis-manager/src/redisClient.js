var redis = require('redis');
// const bluebird = require('bluebird');
// bluebird.promisifyAll(redis);

export default {
  createConnection(host, port, auth) {
    console.log(host, port, auth, redis);
    // return 666;

    var client = redis.createClient(port, host);
return client;
    client.on("error", function (err) {
        alert(err);
        return false;
    });

    // return client;
    return 888;
  }
}
