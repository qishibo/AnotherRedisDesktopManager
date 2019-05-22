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
    </el-container>

    <ScrollToTop dom=".el-main"></ScrollToTop>
    <UpdateCheck></UpdateCheck>

  </el-container>
</template>

<script>
import Header from './Header';
import Aside from './Aside';
import Command from '@/components/Command';
import Tabs from '@/components/Tabs';
import ScrollToTop from '@/components/ScrollToTop';
import UpdateCheck from '@/components/UpdateCheck';

export default {
  name: 'App',
  components: {Header, Aside, Command, Tabs, ScrollToTop, UpdateCheck},
  mounted() {
    setTimeout(() => {
      this.$bus.$emit('update-check');
    }, 2000);
  },
};

</script>

<style type="text/css">
html {
  height: 100%;
}
body {
  height: 100%;
  padding: 8px;
  margin: 0;
  box-sizing: border-box;
  /*font: caption;*/
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
