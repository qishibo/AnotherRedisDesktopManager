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
        :fetch-suggestions="inputSuggestion"
        :placeholder="$t('message.enter_to_exec')"
        :select-when-unmatched="true"
        :trigger-on-focus="false"
        popper-class="cli-console-suggestion"
        @keyup.enter.native="consoleExec"
        ref="cliParams"
        @keyup.up.native="searchUp"
        @keyup.down.native="searchDown">
      </el-autocomplete>
    </el-form-item>
  </el-form>
</div>
</template>

<script type="text/javascript">
import rawCommand from '@/rawCommand';
import splitargs from 'redis-splitargs';

export default {
  data() {
    return {
      params: '',
      content: '',
      historyIndex: 0,
      inputSuggestionItems: [],
      multiQueue: null,
    };
  },
  props: ['client'],
  methods: {
    initShow() {
      this.$refs.cliParams.focus();
      this.initCliContent();
    },
    initCliContent() {
      this.content += `> ${this.client.options.connectionName} connected!\n`;
      this.scrollToBottom();
    },
    inputSuggestion(input, cb) {
      if (!this.params) {
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
    consoleExec() {
      const params = this.params.replace(/^\s+|\s+$/g, '');
      const paramsArr = splitargs(params);

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

        this.client.multi(this.multiQueue).exec((err, reply) => {
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
        this.multiQueue.push(['call', paramsArr[0], ...paramsArr.slice(1)]);
        return this.scrollToBottom('QUEUED');
      }

      // normal command
      let promise = rawCommand.exec(this.client, paramsArr);

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

      if (operate === 'select' && !isNaN(params[1])) {
        this.$bus.$emit('changeDb', this.client, params[1]);
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

      if (result === null) {
        append = `${null}\n`;
      }
      else if (typeof result === 'object' && !Buffer.isBuffer(result)) {
        const isArray = Array.isArray(result);

        for (const i in result) {
          if (typeof result[i] === 'object' && result[i] !== null) {
            // fix ioredis pipline result such as [[null, "v1"], [null, "v2"]]
            // null is the result, and v1 is the value
            if (result[i][0] === null) {
              append += this.resolveResult(result[i][1]);
            }
            else {
              append += this.resolveResult(result[i]);
            }
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
  },
  mounted() {
    this.initShow();
  }
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
</style>
