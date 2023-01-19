<template>
<div>
  <el-form @submit.native.prevent>
    <el-form-item>
      <!-- content textarea -->
      <!-- <el-input
        ref="cliContent"
        type="textarea"
        :value="contentStr"
        rows='22'
        :disabled="true"
        :readonly="true"
        id='cli-content'>
      </el-input> -->

      <CliContent ref="editor" :content="contentStr"></CliContent>

      <!-- input params -->
      <el-autocomplete
        class="input-suggestion"
        autocomplete="off"
        v-model="params"
        :debounce='10'
        :disabled='subscribeMode || monitorMode'
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
  <el-button v-else-if='monitorMode' @click='stopMonitor' type='danger' class='stop-subscribe'>Stop Monitor</el-button>
</div>
</template>

<script type="text/javascript">
import { allCMD } from '@/commands';
import splitargs from '@qii404/redis-splitargs';
import { ipcRenderer } from 'electron';
import CliContent from '@/components/CliContent';

export default {
  data() {
    return {
      params: '',
      content: [],
      historyIndex: 0,
      inputSuggestionItems: [],
      multiQueue: null,
      subscribeMode: false,
      monitorMode: false,
      maxHistory: 2000,
    };
  },
  props: ['client', 'hotKeyScope'],
  components: { CliContent },
  computed: {
    paramsTrim() {
      return this.params.replace(/^\s+|\s+$/g, '');
    },
    paramsArr() {
      try {
        // buf array
        let paramsArr = splitargs(this.paramsTrim, true);
        // command to string
        paramsArr[0] = paramsArr[0].toString();

        return paramsArr;
      }
      catch(e) {
        return [this.paramsTrim];
      }
    },
    contentStr() {
      if (this.content.length > this.maxHistory) {
        // this.content = this.content.slice(-this.maxHistory);
        this.content.splice(0, this.content.length - this.maxHistory);
      }

      return this.content.join("\n") + "\n";
    },
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
      this.content.push(`\n> ${this.anoClient.options.connectionName} connected!`);
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

      let items = this.inputSuggestionItems.filter(function (item) {
        return item.toLowerCase().indexOf(input.toLowerCase()) !== -1;
      });

      // add cmd tips
      items = this.addCMDTips(items);

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
        return items;
      }

      for (const key in allCMD) {
        if (key.startsWith(cmd)) {
          const tip = allCMD[key];
          // single tip
          if (typeof tip === 'string') {
            items.unshift(tip);
          }

          // with sub commands, such as CONFIG SET/GET...
          else {
            items = tip.concat(items);
          }
        }
      }

      return items;
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
    stopMonitor() {
      this.monitorMode = false;
      this.monitorInstance && this.monitorInstance.disconnect();
    },
    consoleExec() {
      const params = this.paramsTrim;
      const paramsArr = this.paramsArr;

      this.params = '';
      this.content.push(`> ${params}`);

      // append to history command
      this.appendToHistory(params);

      if (params == 'exit' || params == 'quit') {
        return this.$bus.$emit('removePreTab');
      }

      if (params == 'clear') {
        return this.content = [];
      }

      // mock help command
      if (paramsArr[0].toLowerCase() == 'help') {
        return this.scrollToBottom('Input your command and select from tips');
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
            this.content.push(`${err}`);
          }
          else {
            this.content.push(this.resolveResult(reply).trim());
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

      // monitor command
      if (paramsArr[0].toLowerCase() == 'monitor') {
        this.anoClient.monitor().then(monitor => {
          this.monitorMode = true;
          this.scrollToBottom('OK');
          this.monitorInstance = monitor;
          this.monitorInstance.on("monitor", (time, args, source, database) => {
            this.scrollToBottom(`${time} [${database} ${source}] ${args.join(' ')}`);
          });
        });

        return;
      }

      // normal command
      let promise = this.anoClient.callBuffer(paramsArr[0].toLowerCase(), paramsArr.slice(1));

      // normal command promise
      promise.then((reply) => {
        this.content.push(this.resolveResult(reply).trim());
        this.execFinished(paramsArr);
        this.scrollToBottom();
      }).catch((err) => {
        this.multiQueue = null;
        this.scrollToBottom(err.message);
      });
    },
    execFinished(params) {
      const operate = params[0].toLowerCase();

      if (operate === 'select' && !isNaN(params[1])) {
        this.$bus.$emit('changeDb', this.anoClient, params[1]);
      }

      // operate may add new key, refresh left key list
      if (['hmset', 'hset', 'lpush', 'rpush', 'set', 'sadd', 'zadd', 'xadd', 'json.set'].includes(operate)) {
        this.$bus.$emit('refreshKeyList', this.client, Buffer.from(params[1]), 'add');
      }
      if (['del'].includes(operate)) {
        this.$bus.$emit('refreshKeyList', this.client, Buffer.from(params[1]), 'del');
      }
    },
    scrollToBottom(append = '') {
      append && (this.content.push(`${append}`));

      this.$nextTick(() => {
        if (this.$refs.editor) {
          return this.$refs.editor.scrollToBottom();
        }
        
        if (!this.$refs.cliContent) {
          return;
        }

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
        this.content = [];
      });
    },
    initHistoryTips() {
      const key = `cliTips_${this.client.options.connectionName}`;
      const tips = localStorage.getItem(key);

      this.inputSuggestionItems = tips ? JSON.parse(tips) : [];

      ipcRenderer.on('closingWindow', (event, arg) => {
        this.storeCommandTips();
      });
    },
    storeCommandTips() {
      const key = `cliTips_${this.client.options.connectionName}`;
      localStorage.setItem(key, JSON.stringify(this.inputSuggestionItems.slice(-200)));
    },
  },
  mounted() {
    this.initShow();
    this.initShortcut();
    this.initHistoryTips();
  },
  beforeDestroy() {
    this.anoClient && this.anoClient.quit && this.anoClient.quit();
    this.$shortcut.deleteScope(this.hotKeyScope);
    this.storeCommandTips();
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
