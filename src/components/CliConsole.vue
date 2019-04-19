<template>
    <el-dialog class="cli-dailog"  fullscreen="true" :title="consoleTitle()" @opened="openConsole" :visible.sync="cliDialog.visible">
      <el-form @submit.native.prevent>

        <el-form-item>
          <el-input id="cli-content" type="textarea" v-model="cliContent.content" rows='25' :disabled="true" class="cli-content-textarea"></el-input>

          <el-autocomplete
            class="input-suggestion"
            autocomplete="off"
            v-model="cliContent.params"
            :fetch-suggestions="inputSuggestion"
            :placeholder="$t('message.enter_to_exec')"
            :select-when-unmatched="true"
            :trigger-on-focus="false"
            @keyup.enter.native="consoleExec"
            ref="cliParams"
          >
            <!-- @keyup.up.native="searchUp" -->
            <!-- @keyup.down.native="searchDown" -->
          </el-autocomplete>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cliContent.content=''">{{ $t('message.clean_up') }}</el-button>
        <el-button @click="cliDialog.visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      </div>
    </el-dialog>
</template>

<script type="text/javascript">
import rawCommand from '@/rawCommand';
import storage from '@/storage.js';
import redisClient from '@/redisClient.js';

export default {
  data() {
    return {
      cliContent: { content: '', params: '' },
      inputSuggestionItems: new Set(),
      historyIndex: 0,
    };
  },

  props: ['cliDialog'],

  methods: {
    inputSuggestion(input, cb) {
      const suggestions = [];

      if (!this.cliContent.params) {
        cb(suggestions);
        return;
      }

      for (const key of this.inputSuggestionItems) {
        if (key.indexOf(input) !== -1) {
          suggestions.push({ value: key });
        }
      }

      cb(suggestions);
    },
    consoleTitle() {
      const client = this.$util.get('client');

      if (!client) {
        return 'Client Not Yet, Please Add A Connection First';
      }

      const { host } = client.options;
      const { port } = client.options;
      const dbIndex = client.selected_db;

      const consoleName = `${host}:${port} #db${dbIndex || '0'}`;

      return `${this.$t('message.redis_console')} [${consoleName}]`;
    },
    consoleExec() {
      const { params } = this.cliContent;
      const promise = rawCommand.exec(this, params);

      this.cliContent.content += `> ${params}\n`;
      this.cliContent.params = '';
      this.historyIndex = 0;

      if (!promise) {
        this.cliContent.content += '(error) ERR unknown command\n';

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } else {
        promise.then((reply) => {
          let append = '';

          if (reply === null) {
            append = `${null}\n`;
          } else if (typeof reply === 'object') {
            const isArray = !isNaN(reply.length);

            for (const i in reply) {
              append += `${(isArray ? '' : (`${i}\n`)) + reply[i]}\n`;
            }
          } else {
            append = `${reply}\n`;
          }

          this.cliContent.content += append;
          this.inputSuggestionItems.delete(params);
          this.inputSuggestionItems.add(params);

          this.$nextTick(() => {
            this.scrollToBottom();
          });
        });
      }
    },
    searchUp() {
      if (--this.historyIndex < (-this.inputSuggestionItems.size - 1)) {
        this.historyIndex = -this.inputSuggestionItems.size - 1;
      }

      const stopIndex = this.inputSuggestionItems.size + this.historyIndex;

      if (stopIndex < 0) {
        this.cliContent.params = '';
        return;
      }

      let counter = 0;

      for (const i of this.inputSuggestionItems) {
        if (counter++ == stopIndex) {
          this.cliContent.params = i;
        }
      }
    },
    searchDown() {
      if (++this.historyIndex > 0) {
        this.historyIndex = 0;
      }

      const stopIndex = this.inputSuggestionItems.size + this.historyIndex;

      if (stopIndex >= this.inputSuggestionItems.size) {
        this.cliContent.params = '';
        return;
      }

      let counter = 0;

      for (const i of this.inputSuggestionItems) {
        if (counter++ == stopIndex) {
          this.cliContent.params = i;
        }
      }
    },
    scrollToBottom() {
      const textarea = document.getElementById('cli-content');
      textarea.scrollTop = textarea.scrollHeight;
    },
    openConsole() {
      this.$refs.cliParams.focus();
      this.historyIndex = 0;

      this.initCliContent();
    },
    initDefaultConnection() {
      if (this.$util.get('client')) {
        return true;
      }

      const connections = storage.getConnections(true);
      const connection = connections[0];

      if (!connection) {
        return;
      }

      if (connection.sshOptions) {
        let sshPromise = redisClient.createSSHConnection(connection.sshOptions, connection.host, connection.port, connection.auth);

        sshPromise.then((client) => {
          this.$util.set('client', client);
        });
      }

      else {
        let client = redisClient.createConnection(connection.host, connection.port, connection.auth);
        this.$util.set('client', client);
      }
    },
    initCliContent() {
      const { options } = this.$util.get('client');

      const content = `> ${options.host} connected!\n`;
      this.cliContent.content += content;

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
  },

  mounted() {
    this.initDefaultConnection();
  },
};
</script>

<style type="text/css">
  .cli-dailog .el-dialog__body {
    padding: 0 20px;
  }
  .input-suggestion {
    width: 100%;
    line-height: 34px !important;
  }

  .input-suggestion input {
    color: #babdc1 !important;
    background: #263238;
    border-top: 0px;
    border-radius: 0 0 4px 4px;
  }

  .input-suggestion input::-webkit-input-placeholder {
    color: #8a8b8e;
  }

  #cli-content {
    color: #babdc1;
    background: #263238;
    border-bottom: 0px;
    border-radius: 4px 4px 0 0;
    cursor: text;
  }
</style>
