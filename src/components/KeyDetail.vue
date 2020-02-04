<template>
  <div>
    <el-container direction="vertical" class="key-tab-container">
      <!-- key info -->
      <KeyHeader ref="keyHeader" :redisKey="redisKey" :keyType="keyType" :syncKeyParams = "syncKeyParams" class="key-header-info"></KeyHeader>

      <!-- key content -->
      <component ref="keyContent" :is="componentName" :redisKey="redisKey" :syncKeyParams = "syncKeyParams" class="key-content-container"></component>
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

export default {
  data() {
    return {
      syncKeyParams: { keyTTL: '', keyName: this.redisKey },
    };
  },
  props: ['redisKey', 'keyType'],
  created() {
    this.$bus.$on('refreshKey', (redisKey) => {
      if (!this.redisKey || !this.$refs.keyContent || (this.redisKey !== redisKey)) {
        return;
      }

      this.$refs.keyContent.initShow();
    });
  },
  components: {
    KeyHeader, KeyContentString, KeyContentHash, KeyContentSet, KeyContentZset, KeyContentList
  },
  computed: {
    componentName() {
      return this.getComponentNameByType(this.keyType);
    },
  },
  methods: {
    getComponentNameByType(keyType) {
      const map = {
        'string': 'KeyContentString',
        'hash': 'KeyContentHash',
        'zset': 'KeyContentZset',
        'set': 'KeyContentSet',
        'list': 'KeyContentList',
      };

      return map[keyType];
    },
    refreshAfterAdd(key) {
      this.$bus.$emit('clickedKey', key);
      this.$bus.$emit('refreshKeyList');
    },
    emptyKeyWhenAdding() {
      this.$message.error({
        message: this.$t('message.enter_new_key'),
        duration: 2000,
      });

      this.$refs.keyHeader.$refs.keyNameInput.focus();
    },
  },
};
</script>

<style type="text/css">
  .key-tab-container {
    padding-left: 5px;
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
</style>
