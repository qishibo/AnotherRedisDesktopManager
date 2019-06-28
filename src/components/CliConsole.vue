<template>
    <el-dialog class="cli-dailog" fullscreen :title="consoleTitle()" @opened="openConsole" @close="closeConsole" :visible.sync="cliDialog.visible">
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
            popper-class="cli-console-suggestion"
            @keyup.enter.native="consoleExec"
            ref="cliParams"
            @keyup.up.native="searchUp"
            @keyup.down.native="searchDown"
          >
          </el-autocomplete>

 <!--          <el-input
            class="input-suggestion"
            autocomplete="off"
            v-model="cliContent.params"
            :placeholder="$t('message.enter_to_exec')"
            @keyup.enter.native="consoleExec"
            ref="cliParams"
            @keyup.up.native="searchUp"
            @keyup.down.native="searchDown"
          >
          </el-input> -->
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cliContent.content=''">{{ $t('message.clean_up') }}</el-button>
        <el-button @click="cliDialog.visible = false">{{ $t('message.close') }}</el-button>
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
      // inputSuggestionItems: new Set(),
      inputSuggestionItems: [],
      historyIndex: 0,
      multiClient: null,
    };
  },

  props: ['cliDialog'],

  methods: {
    inputSuggestion(input, cb) {
      if (!this.cliContent.params) {
        cb([]);
        return;
      }

      const items = this.inputSuggestionItems.filter(function (item) {
        return item.indexOf(input) !== -1;
      });

      const suggestions = [...new Set(items)].map(function (item) {
        return {value: item};
      });

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
      let { params } = this.cliContent;
      params = params.replace(/^\s+|\s+$/g, '');

      this.cliContent.params = '';
      this.cliContent.content += `> ${params}\n`;

      // append to history command
      this.appendToHistory(params);

      if (params == 'exit' || params == 'quit') {
        this.cliDialog.visible = false;
        return;
      }

      if (params == 'clear') {
        this.cliContent.content = '';
        return;
      }

      if (params === 'multi') {
        this.multiClient = this.$util.get('client').multi();
        this.cliContent.content += "OK\n";

        this.scrollToBottom();

        return;
      }

      const promise = rawCommand.exec(this.multiClient ? this.multiClient : this.$util.get('client'), params);

      if (!promise) {
        this.cliContent.content += '(error) ERR unknown command\n';
        this.scrollToBottom();

        return;
      }

      if (params === 'exec') {
        this.multiClient = null;
      }

      if (this.multiClient && (params !== 'exec')) {
        this.cliContent.content += "QUEUED\n";
        this.scrollToBottom();

        return;
      }

      promise.then((reply) => {
        this.cliContent.content += this.resolveResult(reply);
        this.scrollToBottom();
      }).catch((err) => {
        this.cliContent.content += `${err.message}\n`;
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const textarea = document.getElementById('cli-content');
        textarea.scrollTop = textarea.scrollHeight;
      });
    },
    appendToHistory(params) {
      if (!params || !params.length) {
        return;
      }

      const items = this.inputSuggestionItems;

      if (items[items.length - 1] !== params) {
        items.push(params);
      }

      this.inputSuggestionItems = items;
      this.historyIndex = items.length;
    },
    resolveResult(result) {
      let append = '';

      if (result === null) {
        append = `${null}\n`;
      }
      else if (typeof result === 'object') {
        const isArray = !isNaN(result.length);

        for (const i in result) {
          if (typeof result[i] === 'object') {
            append += this.resolveResult(result[i]);
          }

          else {
            append += `${(isArray ? '' : (`${i}\n`)) + result[i]}\n`;
          }
        }
      }
      else {
        append = `${result}\n`;
      }

      return append;
    },
    searchUp() {
      if (this.suggesttionShowing()) {
        return;
      }

      (--this.historyIndex < 0) && (this.historyIndex = 0);

      if (!this.inputSuggestionItems[this.historyIndex]) {
        this.cliContent.params = '';
        return;
      }

      this.cliContent.params = this.inputSuggestionItems[this.historyIndex];
    },
    searchDown() {
      if (this.suggesttionShowing()) {
        return;
      }

      if (++this.historyIndex > this.inputSuggestionItems.length) {
        this.historyIndex = this.inputSuggestionItems.length;
      }

      if (!this.inputSuggestionItems[this.historyIndex]) {
        this.cliContent.params = '';
        return;
      }

      this.cliContent.params = this.inputSuggestionItems[this.historyIndex];
    },
    suggesttionShowing() {
      const ele = document.querySelector('.cli-console-suggestion');

      if (ele && ele.style.display != 'none') {
        return true;
      }

      return false;
    },
    openConsole() {
      this.$refs.cliParams.focus();
      this.historyIndex = this.inputSuggestionItems.length;

      this.initDefaultConnection();
      this.initCliContent();
    },
    closeConsole() {
      this.$bus.$emit('closeConsole');
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
      const client = this.$util.get('client');

      if (!client || !client.options) {
        return;
      }

      this.cliContent.content += `> ${client.options.host} connected!\n`;
      this.scrollToBottom();
    },
    keyUpFocus() {
      this.$refs.cliParams && this.$refs.cliParams.focus();
    },
  },
  mounted() {
    // this.initDefaultConnection();
    // document.body.addEventListener('keyup', this.keyUpFocus);
  },
  destroyed() {
    // document.body.removeEventListener('keyup', this.keyUpFocus);
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
