<template>
  <div>
    <el-container direction="vertical">
      <el-main>
        <KeyHeader :redisKey="redisKey" :keyType="keyType"></KeyHeader>
      </el-main>
      <el-main >
        <component ref="keyContent" :is="component" :redisKey="redisKey"></component>
      </el-main>
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
import Status from '@/components/Status';

export default {
  data() {
    return {
    };
  },
  created() {
    this.$bus.$on('refreshKey', (redisKey) => {
      if (!this.redisKey || !this.$refs.keyContent || (this.redisKey !== redisKey)) {
        return;
      }

      this.$refs.keyContent.initShow();
    });
  },
  components: {
    KeyHeader, KeyContentString, KeyContentHash, KeyContentSet, KeyContentZset, KeyContentList, Status,
  },
  props: ['component', 'redisKey', 'keyType'],

  beforeDestroy() {
    // this.$bus.$off('refreshKey');
  },
};
</script>
