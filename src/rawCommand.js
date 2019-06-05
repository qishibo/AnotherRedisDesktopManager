export default {
  exec(vue, params) {
    const client = vue.$util.get('client');

    if (!client) {
      alert('Redis Client Is Not Yet');
      return;
    }

    params = params.trim().match(/(?:[^\s"]+|"[^"]*")+/g);
    const operation = params.shift();

    params = params.map((val) => {
      return val.replace(/^"|"$/g, '');
    });

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
