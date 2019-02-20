<template>
  <div>
    <el-button type="primary" icon="el-icon-setting" @click="dialogFormVisible = true" plain></el-button>

    <el-dialog :title="$t('message.settings')" :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="连接名称" >
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="连接区域" >
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="saveSettings">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- cli console -->
    <el-tooltip effect="dark" :content="$t('message.redis_console')" placement="bottom">
      <el-button type="info" @click="cliDialogVisible = true" plain><i class="fa fa-terminal"></i></el-button>
    </el-tooltip>

    <el-dialog width="90%" :title="consoleTitle()" @opened="openConsole" :visible.sync="cliDialogVisible">
      <el-form @submit.native.prevent>
        <el-form-item>
          <el-input id="cli-content" type="textarea" v-model="cliContent.content" :autosize="{ minRows: 8, maxRows: 8}" placeholder="console result" :disabled="true" class="cli-content-textarea"></el-input>
        </el-form-item>

        <el-form-item>
          <el-autocomplete
            class="input-suggestion"
            v-model="cliContent.params"
            :fetch-suggestions="inputSuggestion"
            placeholder=" Such As [set some_key some_value], Click Enter To Submit"
            :trigger-on-focus="false"
            @keyup.enter.native="consoleExec"
            ref="cliParams"
          ></el-autocomplete>
          <!-- @keyup.enter.native="consoleExec" -->
          <!-- @keyup.up.native="searchUp" -->
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cliContent.content=''">{{ $t('message.clean_up') }}</el-button>
        <el-button @click="cliDialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      </div>
    </el-dialog>

    <el-select v-model="selectedLang" @change="changeLang" placeholder="Language">
        <el-option
          v-for="item in langItems"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

  </div>
</template>


<script>
import rawCommand from '@/rawCommand';

export default {
  data() {
    return {
      form: {
        name: '',
        region: ''
      },
      dialogFormVisible: false,
      selectedLang: 'en',
      langItems: [
        {value: 'en', label: 'English'},
        {value: 'cn', label: '简体中文'},
      ],
      cliDialogVisible: false,
      cliContent: {content: '', params: ''},
      inputSuggestionItems: new Set(),
      historyIndex: 0,
    };
  },
  methods: {
    inputSuggestion(input, cb) {
      let suggestions = [];
      for (var key of this.inputSuggestionItems) {
        if (key.indexOf(input) !== -1) {
          suggestions.push({value: key});
        }
      }
      cb(suggestions);
    },
    showSettings: function () {
      let settings = this.getSettings();

      if (!settings) {
        return;
      }

      settings = JSON.parse(settings);

      this.form = settings;
    },
    getSettings () {
      return localStorage.getItem('settings');
    },
    saveSettings() {
      let settings = JSON.stringify(this.form);
      console.log('saving settings...', settings);

      localStorage.setItem('settings', settings);

      this.dialogFormVisible = false;
    },
    changeLang(lang) {
      localStorage.lang = this.selectedLang;
      this.$i18n.locale = this.selectedLang;
    },
    consoleTitle() {
      let client = this.$util.get('client');

      if (!client) {
        return 'Client Not Yet';
      }

      let host = client.options.host;
      let port = client.options.port;
      let dbIndex = client.selected_db;

      let consoleName = host + ':' + port + ' DB' + (dbIndex ? dbIndex : '0');

      return this.$t('message.redis_console') + ' ' + consoleName;
    },
    consoleExec() {
      let params = this.cliContent.params;
      let promise = rawCommand.exec(this, params);

      this.cliContent.content += '> ' + params + "\n";
      this.cliContent.params = '';
      this.historyIndex = 0;

      if (!promise) {
        this.cliContent.content += "Error!\n";

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }

      else {
        promise.then((reply) => {
          let append  = '';

          if (reply === null) {
            append = null + "\n";
          }

          else if (typeof reply === 'object') {
            let isArray = !isNaN(reply.length);

            for (var i in reply) {
              append += (isArray ? '' : (i + "\n")) + reply[i] + "\n";
            }
          }

          else {
            append = reply + "\n";
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

      let stopIndex = this.inputSuggestionItems.size + this.historyIndex;

      if (stopIndex < 0) {
        this.cliContent.params = '';
        return;
      }

      let counter = 0;

      for (var i of this.inputSuggestionItems) {
        if (counter++ == stopIndex) {
          this.cliContent.params = i;
        }
      }
    },
    searchDown() {
      if (++this.historyIndex > 0) {
        this.historyIndex = 0;
      }

      let stopIndex = this.inputSuggestionItems.size + this.historyIndex;

      if (stopIndex >= this.inputSuggestionItems.size) {
        this.cliContent.params = '';
        return;
      }

      let counter = 0;

      for (var i of this.inputSuggestionItems) {
        if (counter++ == stopIndex) {
          this.cliContent.params = i;
        }
      }
    },
    scrollToBottom() {
      let textarea = document.getElementById('cli-content');
      textarea.scrollTop = textarea.scrollHeight;
    },
    openConsole() {
      this.$refs.cliParams.focus();
      this.historyIndex = 0;
    },
  },
  mounted() {
    this.selectedLang = localStorage.lang || this.selectedLang;
    this.showSettings();
  }
};
</script>

<style type="text/css">
  .input-suggestion {
    width: 100%;
  }

  .cli-content-textarea textarea {
    color: #7e8186 !important;
  }
</style>
