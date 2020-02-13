export default {
  exec(client, params = []) {
    if (!client) {
      alert('Redis Client Is Not Yet');
      return;
    }

    const operation = params[0];

    if (!operation) {
      return;
    }

    if (!client[operation]) {
      return;
    }

    return client[`${operation}Async`](...params.slice(1));
  },
};
