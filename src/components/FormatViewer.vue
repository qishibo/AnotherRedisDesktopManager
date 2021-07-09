<template>
  <div class="format-viewer-container">
    <el-select v-model="selectedView" :disabled='overSize' class='format-selector' :style='selectStyle' size='mini' placeholder='Text'>
      <span slot="prefix" class="fa fa-sitemap"></span>
      <el-option
        v-for="item in viewers"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
    <span @click='copyContent' :title='$t("message.copy")' class='el-icon-document formater-copy-icon'></span>
    <span v-if='!contentVisible' class='formater-binary-tag'>[Hex]</span>
    <span class='formater-binary-tag'>Size: {{ $util.humanFileSize(buffSize) }}</span>
    <br>

    <component
      ref='viewer'
      :is='selectedView'
      :content='content'
      :contentVisible='contentVisible'
      :textrows='textrows'
      :disabled='disabled'
      @updateContent="$emit('update:content', $event)">
    </component>
  </div>
</template>

<script type="text/javascript">
import ViewerText from '@/components/ViewerText';
import ViewerHex from '@/components/ViewerHex';
import ViewerJson from '@/components/ViewerJson';
import ViewerBinary from '@/components/ViewerBinary';
import ViewerUnserialize from '@/components/ViewerUnserialize';
import ViewerMsgpack from '@/components/ViewerMsgpack';
import ViewerOverSize from '@/components/ViewerOverSize';

export default {
  data() {
    return {
      selectedView: '',
      viewers: [
        { value: 'ViewerText', text: 'Text' },
        { value: 'ViewerHex', text: 'Hex' },
        { value: 'ViewerJson', text: 'Json' },
        { value: 'ViewerBinary', text: 'Binary' },
        { value: 'ViewerMsgpack', text: 'Msgpack' },
        { value: 'ViewerUnserialize', text: 'Unserialize' },
      ],
      selectStyle: {
        float: this.float,
      },
      overSizeBytes: 20971520, // 20MB
    };
  },
  components: {ViewerText, ViewerHex, ViewerJson, ViewerBinary, ViewerUnserialize, ViewerMsgpack, ViewerOverSize},
  props: {
    float: {default: 'right'},
    content: {default: () => Buffer.from('')},
    textrows: {default: 6},
    disabled: {type: Boolean, default: false},
  },
  computed: {
    contentVisible() {
      // for better performance, oversize doesn't care visible.
      if (this.overSize) {
        return true;
      }

      return this.$util.bufVisible(this.content);
    },
    buffSize() {
      return Buffer.byteLength(this.content);
    },
    overSize() {
      return this.buffSize > this.overSizeBytes;
    },
  },
  methods: {
    autoFormat() {
      // reload each viewer
      this.selectedView = '';

      this.$nextTick(() => {
        if (!this.content) {
          return this.selectedView = 'ViewerText';
        }

        if (this.overSize) {
          return this.selectedView = 'ViewerOverSize';
        }

        // json
        if (this.$util.isJson(this.content)) {
          this.selectedView = 'ViewerJson';
        }
        // php unserialize
        else if (this.$util.isPHPSerialize(this.content)) {
          this.selectedView = 'ViewerUnserialize';
        }
        // hex
        else if (!this.contentVisible) {
          this.selectedView = 'ViewerHex'
        }
        else {
          this.selectedView = 'ViewerText';
        }
      });
    },
    copyContent() {
      const clipboard = require('electron').clipboard;
      clipboard.writeText(this.content.toString());
      this.$message.success(this.$t('message.copy_success'));
    },
  },
}
</script>

<style type="text/css">
  .format-selector {
    width: 122px;
  }
  .format-selector .el-input__inner {
    height: 22px;
  }

  .text-formated-container {
    border: 1px solid #dcdfe6;
    min-height: 114px;
    padding: 5px 15px;
    line-height: 1.5;
    border-radius: 5px;
  }
  .text-formated-container * {
    font-family: inherit !important;
  }
  .dark-mode .text-formated-container {
    border-color: #7f8ea5;
  }

  /*json tree*/
  .dark-mode .jv-container.jv-light {
    background: none;
  }
  .dark-mode .jv-container.jv-light .jv-key {
    color: #ebebec;
  }
  .dark-mode .jv-container.jv-light .jv-item.jv-array,
  .dark-mode .jv-container.jv-light .jv-item.jv-object {
    color: #b6b6b9;
  }
  .dark-mode .jv-container.jv-light .jv-ellipsis {
    background: #c5c5c5;
  }

  .collapse-container {
    height: 27px;
  }

  .collapse-container .collapse-btn {
    float: right;
    padding: 9px 0;
  }
  .formater-binary-tag {
    /*padding-left: 5px;*/
    color: #7ab3ef;
    font-size: 80%;
  }
  .formater-copy-icon {
    color: #7ab3ef;
    cursor: pointer;
  }
</style>
