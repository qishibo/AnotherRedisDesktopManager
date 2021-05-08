export default {
  message: {
    catchError: '(error) Operate failed',
    clientEmpty: 'Redis Client Is Not Yet',
    unknownCommand: '(error) ERR unknown command',
  },

  exec(client, params = []) {
    if (!client) {
      return this.message.clientEmpty;
    }

    const operation = params[0] ? params[0].toLowerCase() : '';

    return new Promise((resolve, reject) => {
      client.callBuffer(operation, params.slice(1), (err, reply) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(reply);
        }
      });
    });
  }
};
