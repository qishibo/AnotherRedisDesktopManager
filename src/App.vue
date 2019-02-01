<template>
  <el-container class="wrap-container">

    <el-aside width="200px" class="aside-connection" >
      <Aside></Aside>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <Header></Header>
      </el-header>
      <el-main>
        <!-- <router-view/> -->
        <Tabs></Tabs>
      </el-main>

      <!-- <el-main>
        <Command></Command>
      </el-main> -->

    </el-container>
  </el-container>
</template>

<script>
import Header from './Header';
import Aside from './Aside';
import Command from '@/components/Command';
import Tabs from '@/components/Tabs';

export default {
  name: 'App',
  components: {Header, Aside, Command, Tabs}
}

</script>

<style>
html {
  height: 100%;
  /*box-sizing: border-box;*/
}
body {
  height: 100%;
  padding: 8px;
  margin: 0;
  box-sizing: border-box;
}
.wrap-container {
  height: 100%;
}
.aside-connection {
  height: 100%;
}
.main-header.el-header {
  height: 42px !important;
}
.height100 {
  height: 100%;
}
</style>
