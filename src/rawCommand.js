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

    const operation = params[0];

    if (!operation || typeof client[operation] != 'function') {
      return this.message.unknownCommand;
    }

    try {
      return client[operation](...params.slice(1));
    }
    catch (e) {
      return this.message.catchError;
    }
  },
};
