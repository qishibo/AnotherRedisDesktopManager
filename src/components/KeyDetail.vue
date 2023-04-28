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
import KeyContentString from '@/components/KeyContentString';
import KeyContentHash from '@/components/KeyContentHash';
import KeyContentSet from '@/components/KeyContentSet';
import KeyContentZset from '@/components/KeyContentZset';
import KeyContentList from '@/components/KeyContentList';
import KeyContentStream from '@/components/KeyContentStream';
import KeyContentReJson from '@/components/KeyContentReJson';

export default {
  data() {
    return {};
  },
  props: ['client', 'redisKey', 'keyType', 'hotKeyScope'],
  components: {
    KeyHeader, KeyContentString, KeyContentHash, KeyContentSet, KeyContentZset,
    KeyContentList, KeyContentStream, KeyContentReJson
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
        hash  : 'KeyContentHash',
        zset  : 'KeyContentZset',
        set   : 'KeyContentSet',
        list  : 'KeyContentList',
        stream  : 'KeyContentStream',
        'ReJSON-RL': 'KeyContentReJson',
      };

      if (map[keyType]) {
        return map[keyType];
      }
      // type not support, such as bf
      else {
        this.$message.error(this.$t('message.key_type_not_support'));
        return '';
      }
    },
    refreshContent() {
      this.client.exists(this.redisKey).then(reply => {
        if (reply == 0) {
          // clear interval if auto refresh opened
          this.$refs.keyHeader.removeInterval();
          return this.$message.error(this.$t('message.key_not_exists'));
        }

        this.$refs.keyContent && this.$refs.keyContent.initShow();
      }).catch(e => {
        this.$message.error('Exists Error: ' + e.message);
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
    margin-top: 15px;
  }
  .key-content-container {
    margin-top: 15px;
  }
  .key-detail-filter-value {
    width: 60%;
    height: 24px;
    padding: 0 5px;
  }

  /*tooltip in table width limit*/
  .el-tooltip__popper {
    max-width: 50%;
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

  /*data table list styles*/
  .key-content-container .el-table {
    border-radius: 3px;
  }
  /*table list height*/
  .key-content-container .el-table .el-table__body td {
    padding: 0px 0px;
  }

  /*table list border*/
  .key-content-container .el-table--border td, .key-content-container .el-table--border th {
    border-right-width: 0;
  }
</style>
