<template>
  <JsonEditor ref='editor' :content='newContent' class='viewer-custom-editor'>
    <p :title="fullCommand" class="command-preview">{{ previewCommand }}</p>
  </JsonEditor>
</template>

<script type="text/javascript">
import storage from '@/storage';
import shell from 'child_process';
import JsonEditor from '@/components/JsonEditor';
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      execResult: '',
      fullCommand: '',
      previewCommand: '',
      previewContentMax: 100,
      writeHexFileSize: 8000,
    };
  },
  components: { JsonEditor },
  props: ['content', 'name', 'dataMap', 'redisKey'],
  computed: {
    newContent() {
      if (this.$util.isJson(this.execResult)) {
        return JSON.parse(this.execResult);
      }

      return this.execResult;
    },
  },
  watch: {
    content() {
      this.execCommand();
    },
  },
  methods: {
    getCommand() {
      const formatter = storage.getCustomFormatter(this.name);

      if (!formatter) {
        return false;
      }

      const { command } = formatter;
      const { params } = formatter;
      const paramsReplaced = this.replaceTemplate(params);

      return `"${command}" ${paramsReplaced}`;
    },
    replaceTemplate(params) {
      if (!params) {
        return '';
      }

      const dataMap = this.dataMap ? this.dataMap : {};
      const mapObj = {
        '{KEY}': this.redisKey,
        // "{VALUE}": this.content,
        '{FIELD}': dataMap.key,
        '{SCORE}': dataMap.score,
        '{MEMBER}': dataMap.member,
      };

      const re = new RegExp(Object.keys(mapObj).join('|'), 'gi');
      return params.replace(re, matched => mapObj[matched]);
    },
    execCommand() {
      if (!this.content || !this.content.length) {
        return this.execResult = '';
      }

      const command = this.getCommand();
      const hexStr = this.content.toString('hex');

      if (!command) {
        return this.execResult = 'Command Error, Check Config!';
      }

      this.fullCommand = command.replace(
        '{VALUE}',
        this.content,
      );

      // in case of long content in template
      this.previewCommand = command.replace(
        '{VALUE}',
        this.$util.cutString(this.content.toString(), this.previewContentMax),
      );

      // if content is too long, write to file simultaneously
      // hex str is about 2 times of real size
      if (hexStr.length > this.writeHexFileSize) {
        ipcRenderer.invoke('getTempPath').then((reply) => {
          // target file name
          const fileName = `ardm_cv_${this.redisKey.toString('hex')}`;
          const filePath = require('path').join(reply, fileName);

          require('fs').writeFile(filePath, hexStr, (err) => {
            if (err) {
              return this.$message.error(err);
            }

            this.fullCommand = this.fullCommand.replace('{HEX_FILE}', filePath);
            this.previewCommand = this.previewCommand.replace('{HEX_FILE}', filePath);

            this.exec();
          });
        });
      }
      // common content just exec
      else {
        this.fullCommand = this.fullCommand
          .replace('{HEX_FILE}', '')
          .replace(
            '{HEX}',
            hexStr,
          );
        this.previewCommand = this.previewCommand
          .replace('{HEX_FILE}', '')
          .replace(
          '{HEX}',
          this.$util.cutString(hexStr, this.previewContentMax),
          );
        this.exec();
      }
    },
    exec() {
      try {
        shell.exec(this.fullCommand, (e, stdout, stderr) => {
          if (e || stderr) {
            this.execResult = `${e.message.trim()}\n${stdout.trim()}\n${stderr.trim()}`;
          } else {
            this.execResult = stdout.trim();
          }
        });
      } catch (e) {
        return this.execResult = e.message;
      }
    },
  },
  mounted() {
    this.execCommand();
  },
};
</script>

<style type="text/css">
.text-formated-container .command-preview {
  color: #9798a7;
  word-break: break-word;
}

.key-content-string .text-formated-container.viewer-custom-editor #monaco-editor-con {
  height: calc(100vh - 379px);
}
</style>
