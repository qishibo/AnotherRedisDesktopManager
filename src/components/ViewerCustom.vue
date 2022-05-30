<template>
  <JsonEditor ref='editor' :content='newContent' class='viewer-custom-editor'>
    <p :title="fullCommand" class="command-preview">{{ previewCommand }}</p>
  </JsonEditor>
</template>

<script type="text/javascript">
import storage from '@/storage';
import shell from 'child_process';
import JsonEditor from '@/components/JsonEditor';

export default {
  data() {
    return {
      execResult: '',
      fullCommand: '',
      previewCommand: '',
      previewContentMax: 100,
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
      const hexStr  = this.content.toString('hex');

      if (!command) {
        return this.execResult = 'Command Error, Check Config!';
      }

      this.fullCommand = command.replace(
        '{VALUE}',
        this.content,
      ).replace(
        '{HEX}',
        hexStr,
      );

      // in case of long content in template
      this.previewCommand = command.replace(
        '{VALUE}',
        this.$util.cutString(this.content.toString(), this.previewContentMax),
      ).replace(
        '{HEX}',
        this.$util.cutString(hexStr, this.previewContentMax),
      );

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
