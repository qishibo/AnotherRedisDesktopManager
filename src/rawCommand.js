export default {
  exec(vue, params) {
    let client = vue.$util.get('client');

    if (!client) {
      alert('client is not yet');
      return;
    }

    params = params.trim().replace(/\s+/g, ' ');
    params = params.split(' ');

    let operation = params.shift();

    console.log(operation, params);

    if (!operation) {
      return;
    }

    if (!client[operation]) {
      return;
    }

    return client[operation + 'Async'].apply(client, params);
  }
};
