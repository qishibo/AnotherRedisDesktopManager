<template>
  <div>
    <el-container direction="vertical">
      <el-main>
        <KeyHeader :redisKey="redisKey" :keyType="keyType"></KeyHeader>
      </el-main>
      <el-main >
        <component :is="component" :redisKey="redisKey"></component>
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
  components: {KeyHeader, KeyContentString, KeyContentHash, KeyContentSet, KeyContentZset, KeyContentList, Status},
  props: ['component', 'redisKey', 'keyType']
};
</script>
