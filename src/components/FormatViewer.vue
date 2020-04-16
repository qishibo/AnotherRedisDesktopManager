<template>
  <div>
    <el-select v-model="selectedView" class='format-selector' :style='selectStyle' size='mini'>
      <span slot="prefix" class="fa fa-sitemap"></span>
      <el-option
        v-for="item in viewers"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
    <span v-if='binary' class='formater-binary'>Hex</span>
    <br>

    <component
      :is='selectedView'
      :content='content'
      :textrows='textrows'
      @updateContent="$emit('update:content', $event)">
    </component>
  </div>
</template>

<script type="text/javascript">
import ViewerText from '@/components/ViewerText';
import ViewerJson from '@/components/ViewerJson';
import ViewerUnserialize from '@/components/ViewerUnserialize';

export default {
  data() {
    return {
      selectedView: 'ViewerText',
      viewers: [
        { value: 'ViewerText', text: 'Text' },
        { value: 'ViewerJson', text: 'Json' },
        { value: 'ViewerUnserialize', text: 'Unserialize' },
      ],
      selectStyle: {
        float: this.float,
      },
    };
  },
  components: {ViewerText, ViewerJson, ViewerUnserialize},
  props: {
    float: {default: 'right'},
    content: {default: ''},
    textrows: {default: 6},
    binary: {default: false},
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
  .dark-mode .text-formated-container {
    border-color: #7f8ea5;
  }

  /*key field span*/
  .vjs__tree span {
    color: #616069;
  }
  .dark-mode .vjs__tree span:not([class^="vjs"]) {
    color: #ebebec;
  }
  /*brackets*/
  .dark-mode .vjs__tree .vjs__tree__node {
    color: #9e9ea2;
  }
  .dark-mode .vjs__tree .vjs__tree__node:hover {
    color: #20a0ff;
  }

  .collapse-container {
    height: 27px;
  }

  .collapse-container .collapse-btn {
    float: right;
    padding: 9px 0;
  }
  .formater-binary {
    padding-left: 5px;
    color: #7ab3ef;
    font-size: 80%;
  }
</style>
