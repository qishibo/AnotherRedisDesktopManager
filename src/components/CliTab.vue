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
import splitargs from 'splitargs';

export default {
  data() {
    return {
      params: '',
      content: '',
      historyIndex: 0,
      multiClient: null,
      inputSuggestionItems: [],
    };
  },
  props: ['client'],
  methods: {
    initShow() {
      this.$refs.cliParams.focus();
      this.initCliContent();
    },
    initCliContent() {
      this.content += `> ${this.client.options.connection_name} connected!\n`;
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
        this.$bus.$emit('removePreTab');
        return;
      }

      if (params == 'clear') {
        this.content = '';
        return;
      }

      // multi-exec mode
      if (params === 'multi') {
        this.multiClient = this.client.multi();
        this.content += "OK\n";
        this.scrollToBottom();

        return;
      }

      const promise = rawCommand.exec(this.multiClient ? this.multiClient : this.client, paramsArr);

      if (!promise) {
        this.content += '(error) ERR unknown command\n';
        this.scrollToBottom();

        return;
      }

      if (params === 'exec') {
        this.multiClient = null;
      }

      if (this.multiClient && (params !== 'exec')) {
        this.content += "QUEUED\n";
        this.scrollToBottom();

        return;
      }

      promise.then((reply) => {
        this.content += this.resolveResult(reply);
        this.execFinished(paramsArr);
        this.scrollToBottom();
      }).catch((err) => {
        this.content += `${err.message}\n`;
        this.scrollToBottom();
      });
    },
    execFinished(params) {
      const operate = params[0];

      if (operate === 'select' && !isNaN(params[1])) {
        this.$bus.$emit('changeDb', this.client, params[1]);
      }
    },
    scrollToBottom() {
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
  }
  .dark-mode #cli-content {
    color: #f7f7f7;
    background: #324148;
  }
</style>
