<template>
  <el-container class="wrap-container">
    <!-- left aside draggable container -->
    <div class="aside-drag-container" :style="{width: sideWidth + 'px'}">
      <!-- connections -->
      <el-aside class="aside-connection">
        <Aside></Aside>
      </el-aside>

      <!-- drag area -->
      <div id="drag-resize-container">
        <div id="drag-resize-pointer"></div>
      </div>
    </div>

    <!-- right main container -->
    <el-container>
      <!-- top setting header -->
      <el-header class="main-header">
        <Header></Header>
      </el-header>

      <!-- tab container -->
      <el-main>
        <Tabs></Tabs>
      </el-main>
    </el-container>

    <ScrollToTop dom=".el-main"></ScrollToTop>
    <UpdateCheck></UpdateCheck>
  </el-container>
</template>

<script>
import Header from '@/Header';
import Aside from '@/Aside';
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
  created() {
    this.$bus.$on('changeFont', () => {
      this.initFont();
    });
  },
  components: {Header, Aside, Tabs, ScrollToTop, UpdateCheck},
  methods: {
    bindSideBarDrag() {
      const that = this;
      const dragPointer = document.getElementById('drag-resize-pointer');

      function mousemove(e)
      {
        const mouseX = e.x;
        const dragSideWidth = mouseX - 19;

        if ((dragSideWidth > 200) && (dragSideWidth < 500)) {
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
      let fontFamily = this.$storage.getSetting('fontFamily');
      // default font-family
      !fontFamily && (fontFamily = ['Default Initial']);

      document.body.style.fontFamily =
        fontFamily.map((line) => {return `"${line}"`}).join(',');
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

::-webkit-scrollbar {
  width: 9px;
}
::-webkit-scrollbar-track {
  background: #eaeaea;
  border-radius: 4px;
}
::-webkit-scrollbar-track:hover {
  background: #e0e0dd;
}
::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #c1c1c1;
}
::-webkit-scrollbar-thumb:hover {
  background: #7d7d7d;
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
.cursor-pointer {
  cursor: pointer;
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
