// set(k,v)
// get(k)
// del(k)
// hgetall(k)
// hmset(k, {}) hmset(k, k1, v1, k2, v2)
// hset(k, f, v)
// hdel(k, f)
// sadd(k, v)
// zadd(k, s, m)
//

var qii404 = {

    redis: null,

    init: function() {
        this.redis = this.getRedis('10.20.1.133', 6379);

        // let promise = this.exec('get', 'name', []);
        // let promise = this.exec('set', 'name', 999);
        // let promise = this.exec('hset', 'shibohash', ['kkkk', 'vvvvvvvvv']);
        // let promise = this.exec('ttl', 'shibohash');
        // let promise = this.exec('hkeys', 'shibohash');
        // let promise = this.exec('hlen', 'shibohash');
        // let promise = this.exec('del', 'shibohash');
        // let promise = this.exec('sadd', 'shiboset', 222);
        let promise = this.exec('smembers', 'shiboset');


        promise.then((reply) => console.log(reply, 999));

        // this.bindAction();
        this.redis.quit();
    },

    exec: function(operation, key, params) {
        // getAsync('name').then(function(res) {
        //     alert(res); // => 'bar'
        // });
        // return;
        switch (operation) {
            case 'del':
            case 'ttl':
            case 'hkeys':
            case 'hlen':
            case 'smembers':
            case 'get': {
                promise = this.redis[operation + 'Async'].apply(this.redis, [key]);
                break;
            }

            case 'sadd':
            case 'set': {
                promise = this.redis[operation + 'Async'].apply(this.redis, [key, params]);
                break;
            }
            case 'hset': {
                let call = [key, params[0], params[1]];
                promise = this.redis[operation + 'Async'].apply(this.redis, call);
                break;
            }
        }

        return promise;
        // return this.redis[operation + 'Async'](key);
    },

    getRedis: function(host, port, auth) {
        const redis = require('redis');
        const bluebird = require('bluebird');

        bluebird.promisifyAll(redis);

        var client = redis.createClient(port, host);

        client.on("error", function (err) {
            alert(err);
            return false;
        });

        // client.hset("qiihash", {"hashtest 1": "some value"}, redis.print);

        return client;
    },

    bindAction: function() {
        var that = this;

        $('#sub-btn').click(function () {
            var key = $('#key').val();
            var operation = $('#operation').val();

            that.exec(operation, key, '', (err, reply) => {
                $('#result').val(reply);
            });
        })
    }
};

qii404.init();

// function aa(a,b)
// {
//     console.log(a,b);
// }

// const redis = require('redis');

// var client = redis.createClient(6379, '10.20.1.133');

// client.on("error", function (err) {
//     console.log(err);
// });

// // client.get('name', (e, r) => console.log(r));
// client.get.apply(client, ['name', (e, r) => console.log(r)]);
// client.get.apply(null, ['name', (e, r) => console.log(r)]);


// aa(1,2);
// aa.apply(null, [1,2])
