<template>
  <el-container class="wrap-container">

    <el-aside class="aside-connection" :style="{position: 'relative', width: sideWidth + 'px'}">
      <Aside></Aside>
      <div id="drag-resize-container">
        <div id="drag-resize-pointer"></div>
      </div>
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
  data() {
    return {
      sideWidth: 250,
    };
  },
  components: {Header, Aside, Command, Tabs, ScrollToTop, UpdateCheck},
  methods: {
    bindSideBarDrag() {
      const that = this;
      const aside = document.querySelector('.aside-connection');
      const dragPointer = document.getElementById('drag-resize-pointer');

      function mousemove(e)
      {
        const mouseX = e.x;

        if ((mouseX > 200) && (mouseX < 400)) {
          const fixWidth = aside.offsetWidth - aside.clientWidth + 1;
          that.sideWidth = mouseX + fixWidth;
        }
      }

      function mouseup(e)
      {
        document.documentElement.removeEventListener('mousemove', mousemove);
        document.documentElement.removeEventListener('mouseup', mouseup);
      }

      dragPointer.addEventListener('mousedown', (e) => {
        e.preventDefault();

        document.documentElement.addEventListener('mousemove', mousemove);
        document.documentElement.addEventListener('mouseup', mouseup);
      });
    },
  },
  mounted() {
    setTimeout(() => {
      this.$bus.$emit('update-check');
    }, 2000);

    this.bindSideBarDrag();
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

#drag-resize-container {
  position: absolute;
  /*height: 100%;*/
  width: 10px;
  right: 0px;
  top: 0px;
}
#drag-resize-pointer {
  position: fixed;
  height: 100%;
  width: 10px;
  cursor: col-resize;
}
#drag-resize-pointer::after {
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
