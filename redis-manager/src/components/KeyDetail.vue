<template>
  <div>
    <el-container direction="vertical">
      <el-main>
        <KeyHeader></KeyHeader>
      </el-main>
      <el-main :style="{height: '400px'}">
        <component :is="component"></component>
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

  export default {
    data() {
      return {
      };
    },
    components: {KeyHeader, KeyContentString, KeyContentHash, KeyContentSet, KeyContentZset, KeyContentList},
    props: ['component']
  }
</script>
