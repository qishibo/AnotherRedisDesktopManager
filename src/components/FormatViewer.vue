<template>
  <div class="format-viewer-container">
    <el-select v-model="selectedView" class='format-selector' :style='selectStyle' size='mini' placeholder='Text'>
      <span slot="prefix" class="fa fa-sitemap"></span>
      <el-option
        v-for="item in viewers"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
    <span v-if='!contentVisible' class='formater-binary-tag'>[Hex]</span>
    <span class='formater-binary-tag'>Size: {{ $util.humanFileSize(buffSize) }}</span>
    <br>

    <component
      ref='viewer'
      :is='selectedView'
      :content='content'
      :contentVisible='contentVisible'
      :textrows='textrows'
      @updateContent="$emit('update:content', $event)">
    </component>
  </div>
</template>

<script type="text/javascript">
import ViewerText from '@/components/ViewerText';
import ViewerJson from '@/components/ViewerJson';
import ViewerBinary from '@/components/ViewerBinary';
import ViewerUnserialize from '@/components/ViewerUnserialize';

export default {
  data() {
    return {
      selectedView: '',
      viewers: [
        { value: 'ViewerText', text: 'Text' },
        { value: 'ViewerJson', text: 'Json' },
        { value: 'ViewerBinary', text: 'Binary' },
        { value: 'ViewerUnserialize', text: 'Unserialize' },
      ],
      selectStyle: {
        float: this.float,
      },
    };
  },
  components: {ViewerText, ViewerJson, ViewerBinary, ViewerUnserialize},
  props: {
    float: {default: 'right'},
    content: {default: () => Buffer.from('')},
    textrows: {default: 6},
  },
  computed: {
    contentVisible() {
      return this.$util.bufVisible(this.content);
    },
    buffSize() {
      return Buffer.byteLength(this.content);
    },
  },
  methods: {
    autoFormat() {
      // reload each viewer
      this.selectedView = '';

      this.$nextTick(() => {
        if (!this.content) {
          this.selectedView = 'ViewerText';
          return;
        }

        if (this.$util.isJson(this.content)) {
          this.selectedView = 'ViewerJson';
        }
        else {
          this.selectedView = 'ViewerText';
        }
      });
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
</style>
