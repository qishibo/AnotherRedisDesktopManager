<template>
<div>
  <el-form @submit.native.prevent>
    <el-form-item>
      <!-- content textarea -->
      <el-input
        ref="cliContent"
        type="textarea"
        v-model="content"
        rows='22'
        :disabled="true"
        id='cli-content'>
      </el-input>

      <!-- input params -->
      <el-autocomplete
        class="input-suggestion"
        autocomplete="off"
        v-model="params"
        :debounce='10'
        :disabled='subscribeMode'
        :fetch-suggestions="inputSuggestion"
        :placeholder="$t('message.enter_to_exec')"
        :select-when-unmatched="true"
        :trigger-on-focus="false"
        popper-class="cli-console-suggestion"
        ref="cliParams"
        @select='$refs.cliParams.focus()'
        @keyup.enter.native="consoleExec"
        @keyup.up.native="searchUp"
        @keyup.down.native="searchDown">
      </el-autocomplete>
    </el-form-item>
  </el-form>

  <el-button v-if='subscribeMode' @click='stopSubscribe' type='danger' class='stop-subscribe'>Stop Subscribe</el-button>
</div>
</template>

<script type="text/javascript">
import rawCommand from '@/rawCommand';
import cmdTips from '@/cmds';
import splitargs from 'redis-splitargs';

export default {
  data() {
    return {
      params: '',
      content: '',
      historyIndex: 0,
      inputSuggestionItems: [],
      multiQueue: null,
      subscribeMode: false,
    };
  },
  props: ['client', 'hotKeyScope'],
  computed: {
    paramsTrim() {
      return this.params.replace(/^\s+|\s+$/g, '');
    },
    paramsArr() {
      try {
        return splitargs(this.paramsTrim);
      }
      catch(e) {
        return [this.paramsTrim];
      }
    }
  },
  created() {
    this.$bus.$on('changeDb', (client, dbIndex) => {
      if (!this.anoClient || client.options.connectionName != this.anoClient.options.connectionName) {
        return;
      }

      if (this.anoClient.condition.select == dbIndex) {
        return;
      }

      this.anoClient.select(dbIndex);
    });
  },
  methods: {
    initShow() {
      if (!this.client) {
        return;
      }

      // copy to another client
      this.anoClient = this.client.duplicate();
      // bind subscribe messages
      this.bindSubscribeMessage();

      this.anoClient.on('ready', () => {
        !this.anoClient.cliInited && this.initCliContent();
        this.anoClient.cliInited = true;
      });

      this.$nextTick(() => {
        this.$refs.cliParams.focus();
      });
    },
    initCliContent() {
      this.content += `> ${this.anoClient.options.connectionName} connected!\n`;
      this.scrollToBottom();
    },
    tabClick() {
      this.$nextTick(() => {
        this.$refs.cliParams.focus();
      });
    },
    inputSuggestion(input, cb) {
      // tmp store cb
      this.cb = cb;

      if (!this.paramsTrim) {
        cb([]);
        return;
      }

      const items = this.inputSuggestionItems.filter(function (item) {
        return item.toLowerCase().indexOf(input.toLowerCase()) !== -1;
      });

      // add cmd tips
      this.addCMDTips(items);

      const suggestions = [...new Set(items)].map(function (item) {
        return {value: item};
      });

      cb(suggestions);
    },
    addCMDTips(items = []) {
      const paramsArr = this.paramsArr;
      const paramsLen = paramsArr.length;
      const cmd = paramsArr[0].toUpperCase();

      if (!cmd) {
        return;
      }

      for (var i = cmdTips.length - 1; i >= 0; i--) {
        // cmd with param such as 'hget hhh'
        if (paramsLen > 1) {
          if (cmdTips[i].split(' ')[0] === cmd) {
            items.unshift(cmdTips[i]);
          }
        }
        // cmd without param such as 'hget'
        else {
          if (cmdTips[i].startsWith(cmd)) {
            items.unshift(cmdTips[i]);
          }
        }
      }
    },
    bindSubscribeMessage() {
      // bind subscribe message
      this.anoClient.on('message', (channel, message) => {
        this.scrollToBottom(`\n${channel}\n${message}`);
      });

      // bind psubscribe message
      this.anoClient.on('pmessage', (pattern, channel, message) => {
        this.scrollToBottom(`\n${pattern}\n${channel}\n${message}`);
      });
    },
    stopSubscribe() {
      this.subscribeMode = false;
      const subSet = this.anoClient.condition.subscriber.set;

      if (!subSet) {
        return;
      }

      Object.keys(subSet.subscribe).length && this.anoClient.unsubscribe();
      Object.keys(subSet.psubscribe).length && this.anoClient.punsubscribe();
    },
    consoleExec() {
      const params = this.paramsTrim;
      const paramsArr = this.paramsArr;

      this.params = '';
      this.content += `> ${params}\n`;

      // append to history command
      this.appendToHistory(params);

      if (params == 'exit' || params == 'quit') {
        return this.$bus.$emit('removePreTab');
      }

      if (params == 'clear') {
        return this.content = '';
      }

      // multi-exec mode
      if (params == 'multi') {
        this.multiQueue = [];
        return this.scrollToBottom('OK');
      }

      // multi dequeue
      if (params == 'exec') {
        // exec when not multi condition
        if (!Array.isArray(this.multiQueue)) {
          return this.scrollToBottom('(error) ERR EXEC without MULTI');
        }

        this.anoClient.multi(this.multiQueue).execBuffer((err, reply) => {
          if (err) {
            this.content += `${err}\n`;
          }
          else {
            this.content += this.resolveResult(reply);
          }

          this.scrollToBottom();
        });

        return this.multiQueue = null;
      }

      // multi enqueue
      if (Array.isArray(this.multiQueue)) {
        this.multiQueue.push(['callBuffer', paramsArr[0], ...paramsArr.slice(1)]);
        return this.scrollToBottom('QUEUED');
      }

      // subscribe command
      if (/subscribe/.test(paramsArr[0].toLowerCase())) {
        this.subscribeMode = true;
      }

      // normal command
      let promise = rawCommand.exec(this.anoClient, paramsArr);

      // exec error
      if (typeof promise == 'string') {
        // fetal error in some cluster condition
        if (promise == rawCommand.message.catchError) {
          this.multiQueue = null;
        }

        return this.scrollToBottom(promise);
      }

      // normal command promise
      promise.then((reply) => {
        this.content += this.resolveResult(reply);
        this.execFinished(paramsArr);
        this.scrollToBottom();
      }).catch((err) => {
        this.scrollToBottom(err.message);
      });
    },
    execFinished(params) {
      const operate = params[0];

      if (operate.toLowerCase() === 'select' && !isNaN(params[1])) {
        this.$bus.$emit('changeDb', this.anoClient, params[1]);
      }
    },
    scrollToBottom(append = '') {
      append && (this.content += `${append}\n`);

      this.$nextTick(() => {
        const textarea = this.$refs.cliContent.$el.firstChild;
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

      this.historyIndex = items.length;
    },
    resolveResult(result) {
      let append = '';

      // list or dict
      if (typeof result === 'object' && result !== null && !Buffer.isBuffer(result)) {
        const isArray = Array.isArray(result);

        for (const i in result) {
          // list or dict
          if (typeof result[i] === 'object' && result[i] !== null && !Buffer.isBuffer(result[i])) {
            // fix ioredis pipline result such as [[null, "v1"], [null, "v2"]]
            // null is the result, and v1 is the value
            if (result[i][0] === null) {
              append += this.resolveResult(result[i][1]);
            }
            else {
              append += this.resolveResult(result[i]);
            }
          }
          // string buffer null
          else {
            append += (isArray ? '' : (this.$util.bufToString(i) + "\n")) +
                      this.$util.bufToString(result[i]) + "\n";
          }
        }
      }
      // string buffer null
      else {
        append = this.$util.bufToString(result) + "\n";
      }

      return append;
    },
    searchUp() {
      if (this.suggesttionShowing()) {
        return;
      }

      (--this.historyIndex < 0) && (this.historyIndex = 0);

      if (!this.inputSuggestionItems[this.historyIndex]) {
        this.params = '';
        return;
      }

      this.params = this.inputSuggestionItems[this.historyIndex];
    },
    searchDown() {
      if (this.suggesttionShowing()) {
        return;
      }

      if (++this.historyIndex > this.inputSuggestionItems.length) {
        this.historyIndex = this.inputSuggestionItems.length;
      }

      if (!this.inputSuggestionItems[this.historyIndex]) {
        this.params = '';
        return;
      }

      this.params = this.inputSuggestionItems[this.historyIndex];
    },
    suggesttionShowing() {
      const ele = document.querySelector('.cli-console-suggestion');

      if (ele && ele.style.display != 'none') {
        return true;
      }

      return false;
    },
    initShortcut() {
      // this.$shortcut.bind('ctrl+c', this.hotKeyScope, () => {
      //   this.params = '';
      //   this.scrollToBottom('> ^C');
      //   // close the tips
      //   (typeof this.cb == 'function') && this.cb([]);
      // });
      this.$shortcut.bind('ctrl+l, ⌘+l', this.hotKeyScope, () => {
        this.content = '';
      });
    },
  },
  mounted() {
    this.initShow();
    this.initShortcut();
  },
  beforeDestroy() {
    this.anoClient && this.anoClient.quit && this.anoClient.quit();
    this.$shortcut.deleteScope(this.hotKeyScope);
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
    color: #babdc1;
    background: #263238;
    border-top: 0px;
    border-radius: 0 0 4px 4px;
  }
  .dark-mode .input-suggestion input  {
    color: #f7f7f7;
    background: #324148;
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
    height: calc(100vh - 160px);
  }
  .dark-mode #cli-content {
    color: #f7f7f7;
    background: #324148;
  }

  .stop-subscribe {
    position: fixed;
    right: 30px;
    bottom: 104px;
  }
</style>
