<template>
  <el-container>
    <el-aside width="200px" style="max-height: 750px;">
      <Aside></Aside>
    </el-aside>
    <el-container>
      <el-header>
        <Header></Header>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>

      <el-main>
        <!-- <Command></Command> -->
      </el-main>

    </el-container>
  </el-container>
</template>

<script>
import Header from './Header';
import Aside from './Aside';
import Command from '@/components/Command';

export default {
  name: 'App',
  components: {Header, Aside, Command}
}
</script>

<style>
</style>
