<template>
  <el-container class="wrap-container">
    <VueDraggableResizable
      :w="220"
      :draggable="false"
      :minWidth="200"
      :maxWidth="400"
      :handles="['mr']"
      :preventDeactivation="true"
      className="aside-resize-container"
      >
      <el-aside width="100%" class="aside-connection" >
        <Aside></Aside>
      </el-aside>
    </VueDraggableResizable>

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
import VueDraggableResizable from 'vue-draggable-resizable';

export default {
  name: 'App',
  components: {Header, Aside, Command, Tabs, ScrollToTop, UpdateCheck, VueDraggableResizable},
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

.aside-resize-container {
  position: relative !important;
  height: 100% !important;
}
.aside-resize-container .handle-mr {
  position: absolute;
  right: -18px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
}
.handle-mr::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 20px;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(0, 0, 0, 0.2);

  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
}
</style>
