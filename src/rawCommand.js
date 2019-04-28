export default {
  exec(vue, params) {
    const client = vue.$util.get('client');

    if (!client) {
      alert('Redis Client Is Not Yet');
      return;
    }

    params = params.trim().replace(/\s+/g, ' ');
    params = params.split(' ');

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
