<template>
  <div class="format-viewer-container">
    <el-select v-model="selectedView" :disabled='overSize' class='format-selector' :style='selectStyle' size='mini' placeholder='Text'>
      <span slot="prefix" class="fa fa-sitemap"></span>
      <el-option
        v-for="item of viewers"
        :key="item.text"
        :label="item.text"
        :value="item.text">
      </el-option>
      <!-- add custom -->
      <el-option
        @click.native.stop.prevent='addCustomFormatter'
        value='addCustomFormatter'>
        <el-button type='text' icon="el-icon-edit-outline">{{$t('message.custom')}}</el-button>
      </el-option>
    </el-select>
    <el-tag v-if='!contentVisible' size="mini" class='formater-binary-tag' :disable-transitions='true'>[Hex]</el-tag>
    <el-tag class='formater-binary-tag' size="mini" :disable-transitions='true'>Size: {{ $util.humanFileSize(buffSize) }}</el-tag>
    <el-button  @click='copyContent' :title='$t("message.copy")' type='text' size='mini'>
      <i class="el-icon-document"></i>{{$t("message.copy")}}
    </el-button>
    <br>

    <component
      ref='viewer'
      :is='viewerComponent'
      :content='content'
      :name="selectedView"
      :contentVisible='contentVisible'
      :disabled='disabled'
      :redisKey="redisKey"
      :dataMap="dataMap">
    </component>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage';
import ViewerText from '@/components/ViewerText';
import ViewerHex from '@/components/ViewerHex';
import ViewerJson from '@/components/ViewerJson';
import ViewerBinary from '@/components/ViewerBinary';
import ViewerUnserialize from '@/components/ViewerUnserialize';
import ViewerBrotli from '@/components/ViewerBrotli';
import ViewerGzip from '@/components/ViewerGzip';
import ViewerDeflate from '@/components/ViewerDeflate';
import ViewerMsgpack from '@/components/ViewerMsgpack';
import ViewerOverSize from '@/components/ViewerOverSize';
import ViewerCustom from '@/components/ViewerCustom';
import ViewerProtobuf from '@/components/ViewerProtobuf';
import ViewerDeflateRaw from '@/components/ViewerDeflateRaw';

export default {
  data() {
    return {
      viewerComponent: 'ViewerText',
      selectedView: 'Text',
      viewers: [
        { value: 'ViewerText', text: 'Text' },
        { value: 'ViewerHex', text: 'Hex' },
        { value: 'ViewerJson', text: 'Json' },
        { value: 'ViewerBinary', text: 'Binary' },
        { value: 'ViewerMsgpack', text: 'Msgpack' },
        { value: 'ViewerUnserialize', text: 'Unserialize' },
        { value: 'ViewerBrotli', text: 'Brotli' },
        { value: 'ViewerGzip', text: 'Gzip' },
        { value: 'ViewerDeflate', text: 'Deflate' },
        { value: 'ViewerDeflateRaw', text: 'DeflateRaw' },
        { value: 'ViewerProtobuf', text: 'Protobuf' },
      ],
      selectStyle: {
        float: this.float,
      },
      overSizeBytes: 20971520, // 20MB
      autoFormated: false,
    };
  },
  components: {
    ViewerText,
    ViewerHex,
    ViewerJson,
    ViewerBinary,
    ViewerUnserialize,
    ViewerMsgpack,
    ViewerOverSize,
    ViewerCustom,
    ViewerBrotli,
    ViewerGzip,
    ViewerDeflate,
    ViewerProtobuf,
    ViewerDeflateRaw,
  },
  props: {
    float: { default: 'right' },
    content: { default: () => Buffer.from('') },
    disabled: { type: Boolean, default: false },
    redisKey: { default: () => Buffer.from('') },
    dataMap: { type: Object, default: () => {} },
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
    viewersMap() {
      // add oversize tmp
      const map = { OverSize: 'ViewerOverSize' };

      this.viewers.forEach((item) => {
        map[item.text] = item.value;
      });

      return map;
    },
  },
  created() {
    this.$bus.$on('refreshViewers', () => {
      this.removeCustom();
      this.loadCustomViewers();
    });
  },
  watch: {
    content() {
      // auto format only when first in #920
      if (this.autoFormated) {
        return;
      }

      this.autoFormat();
      this.autoFormated = true;
    },
    selectedView(viewer) {
      // custom viewer com may same, force change
      this.viewerComponent = '';
      this.$nextTick(() => {
        this.viewerComponent = this.viewersMap[viewer];
      });
    },
  },
  methods: {
    getContent() {
      if (typeof this.$refs.viewer.getContent === 'function') {
        return this.$refs.viewer.getContent();
      }

      return this.content;
    },
    changeViewer(viewer) {
      this.selectedView = viewer;
      this.viewerComponent = this.viewersMap[viewer];
    },
    addCustomFormatter() {
      this.$bus.$emit('addCustomFormatter');
      this.autoFormat();
    },
    autoFormat() {
      if (!this.content || !this.content.length) {
        return this.changeViewer('Text');
      }

      if (this.overSize) {
        return this.changeViewer('OverSize');
      }

      // json
      if (this.$util.isJson(this.content)) {
        return this.changeViewer('Json');
      }
      // php unserialize
      if (this.$util.isPHPSerialize(this.content)) {
        return this.changeViewer('Unserialize');
      }
      // msgpack
      if (this.$util.isMsgpack(this.content)) {
        return this.changeViewer('Msgpack');
      }
      // brotli unserialize
      if (this.$util.isBrotli(this.content)) {
        return this.changeViewer('Brotli');
      }
      // gzip
      if (this.$util.isGzip(this.content)) {
        return this.changeViewer('Gzip');
      }
      // deflate
      if (this.$util.isDeflate(this.content)) {
        return this.changeViewer('Deflate');
      }
      // protobuf
      if (this.$util.isProtobuf(this.content)) {
        return this.changeViewer('Protobuf');
      }
      // deflateRaw
      if (this.$util.isDeflateRaw(this.content)) {
        return this.changeViewer('DeflateRaw');
      }

      // hex
      if (!this.contentVisible) {
        return this.changeViewer('Hex');
      }

      return this.changeViewer('Text');
    },
    copyContent() {
      const content = (typeof this.$refs.viewer.copyContent === 'function')
        ? this.$refs.viewer.copyContent()
        : this.content;

      this.$util.copyToClipboard(content);
      this.$message.success(this.$t('message.copy_success'));
    },
    loadCustomViewers() {
      const formatters = storage.getCustomFormatter();

      if (!formatters || !formatters.length) {
        return;
      }

      formatters.forEach((formatter) => {
        this.viewers.push({ value: 'ViewerCustom', text: formatter.name, type: 'custom' });
      });
    },
    removeCustom() {
      this.viewers = this.viewers.filter(item => item.type !== 'custom');
    },
  },
  mounted() {
    this.autoFormat();
    this.loadCustomViewers();
  },
};
</script>

<style type="text/css">
  .format-selector {
    width: 130px;
  }
  .format-selector .el-input__inner {
    height: 22px !important;
  }

  /*outline same with text viewer's .el-textarea__inner*/
  .text-formated-container {
    border: 1px solid #dcdfe6;
    padding: 5px 10px;
    border-radius: 4px;
  }
  .dark-mode .text-formated-container {
    border-color: #7f8ea5;
  }

  .format-viewer-container textarea {
    min-height: 194px !important;
    height: calc(100vh - 686px);
  }

  .collapse-container {
    height: 27px;
  }

  .collapse-container .collapse-btn {
    float: right;
    padding: 9px 0;
  }
  .formater-binary-tag {
    font-size: 80%;
  }
</style>
