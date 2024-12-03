<template>
  <div>
    <el-container direction="vertical" class="key-tab-container">
      <!-- key info -->
      <KeyHeader
        ref="keyHeader"
        :client='client'
        :redisKey="redisKey"
        :keyType="keyType"
        @refreshContent='refreshContent'
        @dumpCommand='dumpCommand'
        :hotKeyScope='hotKeyScope'
        class="key-header-info">
      </KeyHeader>

      <!-- key content -->
      <component
        ref="keyContent"
        :is="componentName"
        :client='client'
        :redisKey="redisKey"
        :hotKeyScope='hotKeyScope'
        class="key-content-container">
      </component>
    </el-container>
  </div>
</template>

<script>
import KeyHeader from '@/components/KeyHeader';
import KeyContentString from '@/components/contents/KeyContentString';
import KeyContentHash from '@/components/contents/KeyContentHash';
import KeyContentSet from '@/components/contents/KeyContentSet';
import KeyContentZset from '@/components/contents/KeyContentZset';
import KeyContentList from '@/components/contents/KeyContentList';
import KeyContentStream from '@/components/contents/KeyContentStream';
import KeyContentReJson from '@/components/contents/KeyContentReJson';

export default {
  data() {
    return {};
  },
  props: ['client', 'redisKey', 'keyType', 'hotKeyScope'],
  components: {
    KeyHeader,
    KeyContentString,
    KeyContentHash,
    KeyContentSet,
    KeyContentZset,
    KeyContentList,
    KeyContentStream,
    KeyContentReJson,
  },
  computed: {
    componentName() {
      return this.getComponentNameByType(this.keyType);
    },
  },
  methods: {
    getComponentNameByType(keyType) {
      const map = {
        string: 'KeyContentString',
        hash: 'KeyContentHash',
        zset: 'KeyContentZset',
        set: 'KeyContentSet',
        list: 'KeyContentList',
        stream: 'KeyContentStream',
        'ReJSON-RL': 'KeyContentReJson',
        json: 'KeyContentReJson', // upstash
        'tair-json': 'KeyContentReJson', // tair
      };

      if (map[keyType]) {
        return map[keyType];
      }
      // type not support, such as bf

      this.$message.error(this.$t('message.key_type_not_support'));
      return '';
    },
    refreshContent() {
      this.client.exists(this.redisKey).then((reply) => {
        if (reply == 0) {
          // clear interval if auto refresh opened
          // this.$refs.keyHeader.removeInterval();
          return this.$message.error({
            message: this.$t('message.key_not_exists'),
            duration: 1000,
          });
        }

        this.$refs.keyContent && this.$refs.keyContent.initShow();
      }).catch((e) => {
        this.$message.error(`Exists Error: ${e.message}`);
      });
    },
    dumpCommand() {
      this.$refs.keyContent && this.$refs.keyContent.dumpCommand();
    },
  },
};
</script>

<style type="text/css">
  .key-tab-container {
    /*padding-left: 5px;*/
  }
  .key-header-info {
    margin-top: 6px;
  }
  .key-content-container {
    margin-top: 12px;
  }

  .content-more-container {
    text-align: center;
    margin-top: 10px;
  }
  .content-more-container .content-more-btn {
    width: 95%;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  /*key content table wrapper*/
  .key-content-container .content-table-container {
    height: calc(100vh - 223px);
    margin-top: 10px;
    /*fix vex-table height*/
    overflow-y: hidden;
  }

  /* vxe table cell */
  .key-content-container .content-table-container .vxe-cell {
    overflow: hidden !important;
    line-height: 34px;
  }
  /*  vxe table radius*/
  .key-content-container .content-table-container .vxe-table--border-line {
    border-radius: 3px;
  }

  /*key-content-string such as String,ReJSON*/
  /*text viewer box*/
  .key-content-string .el-textarea textarea {
    font-size: 14px;
    height: calc(100vh - 231px);
  }
  /*json in monaco editor*/
  .key-content-string .text-formated-container .monaco-editor-con {
    height: calc(100vh - 275px);
  }
  .key-content-string .content-string-save-btn {
    width: 100px;
    float: right;
  }
  /*end of key-content-string*/
</style>
