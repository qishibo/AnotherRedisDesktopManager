<template>
  <el-container class="wrap-container" :style="{'font-family': fontFamily}">

    <div class="aside-drag-container" :style="{width: sideWidth + 'px'}">
      <el-aside class="aside-connection">
        <Aside></Aside>
      </el-aside>
      <div id="drag-resize-container">
        <div id="drag-resize-pointer"></div>
      </div>
    </div>

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
      fontFamily: 'Default Initial',
    };
  },
  created() {
    this.$bus.$on('changeFont', () => {
      this.initFont();
    });
  },
  components: {Header, Aside, Command, Tabs, ScrollToTop, UpdateCheck},
  methods: {
    bindSideBarDrag() {
      const that = this;
      const dragPointer = document.getElementById('drag-resize-pointer');

      function mousemove(e)
      {
        const mouseX = e.x;
        const dragSideWidth = mouseX - 19;

        if ((dragSideWidth > 200) && (dragSideWidth < 400)) {
          that.sideWidth = dragSideWidth;
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
    openHrefInBrowser() {
      const shell = require('electron').shell;

      document.addEventListener('click', function (event) {
        const ele = event.target;

        if (ele && (ele.nodeName.toLowerCase() === 'a') && ele.href.startsWith('http')) {
          event.preventDefault();
          shell.openExternal(ele.href);
        }
      });
    },
    initFont() {
      const fontFamily = this.$storage.getSetting('fontFamily');
      fontFamily && (this.fontFamily = fontFamily.join(','));
    }
  },
  mounted() {
    setTimeout(() => {
      this.$bus.$emit('update-check');
    }, 2000);

    this.initFont();
    this.bindSideBarDrag();
    this.openHrefInBrowser();
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

button, input, textarea, .vjs__tree {
  font-family: inherit !important;
}

.wrap-container {
  height: 100%;
}
.aside-drag-container {
  position: relative;
  user-select: none;
}
.aside-connection {
  height: 100%;
  width: 100% !important;
  border-right: 1px solid #e4e0e0;
}
.main-header.el-header {
  height: 42px !important;
}
.height100 {
  height: 100%;
}

.el-message-box .el-message-box__message {
  word-break: break-all;
}

#drag-resize-container {
  position: absolute;
  /*height: 100%;*/
  width: 10px;
  right: -5px;
  top: 0px;
}
#drag-resize-pointer {
  position: fixed;
  height: 100%;
  width: 18px;
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
  right: 0;
  bottom: 0;
  margin: auto;
}
</style>
