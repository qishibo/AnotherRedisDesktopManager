const splitargs = require('splitargs');

export default {
  exec(client, params) {
    // const client = vue.$util.get('client');

    if (!client) {
      alert('Redis Client Is Not Yet');
      return;
    }

    params = splitargs(params);
    const operation = params.shift();

    console.log(operation, params);

    if (!operation) {
      return;
    }

    if (!client[operation]) {
      return;
    }

    return client[`${operation}Async`](...params);
  },
};
