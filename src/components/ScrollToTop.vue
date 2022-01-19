<template>
  <transition name="bounce">
    <div class="to-top-container" :style='style' @click="scrollToTop" v-if="toTopShow">
      <i class="el-icon-to-top el-icon-arrow-up"></i>
    </div>
  </transition>
</template>

<script type="text/javascript">
  export default {
    data() {
      return {
        toTopShow: false,
        scrollTop: 0,
        realDom: null,
        minShowHeight: 500,
      };
    },
    computed: {
      style() {
        let style = {right: '50px'};

        if (!this.posRight) {
          style.right = 'inherit';
        }

        return style;
      },
    },
    props: {
      parentNum: {default: 3},
      posRight: {default: true},
    },
    methods: {
      handleScroll() {
        this.scrollTop = this.realDom.scrollTop;
        this.toTopShow = (this.scrollTop > this.minShowHeight) ? true : false;
      },
      scrollToTop() {
        let timer = null;
        let that = this;

        cancelAnimationFrame(timer);

        timer = requestAnimationFrame(function fn() {
          const nowTop = that.realDom.scrollTop;

          // to top already
          if (nowTop <= 0) {
            cancelAnimationFrame(timer);
            that.toTopShow = false;
          }

          else if (nowTop < 50) {
            that.realDom.scrollTop -= 5;
            timer = requestAnimationFrame(fn);
          }

          else {
            that.realDom.scrollTop -= nowTop * 0.2;
            timer = requestAnimationFrame(fn);
          }
        });
      }
    },
    mounted() {
      this.$nextTick(() => {
        let vueCom = this.$parent;

        for (let i = 0; i < this.parentNum - 1; i++) {
          if (!vueCom.$parent) {
            return;
          }

          vueCom = vueCom.$parent;
        }

        this.realDom = vueCom.$el;

        if (!this.realDom) {
          return;
        }
        this.realDom.addEventListener('scroll', this.handleScroll, true);
      });
    },
    destroyed() {
      this.realDom.removeEventListener('scroll', this.handleScroll, true);
    }
  };
</script>

<style type="text/css">
  .to-top-container {
    background-color: #409eff;
    position: fixed;
    /*right: 50px;*/
    bottom: 30px;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    cursor: pointer;
    transition: .3s;
    box-shadow: 0 3px 6px rgba(0, 0, 0, .5);
    opacity: .5;
    z-index: 10000;
  }
  .to-top-container:hover{
    opacity: 1;
  }
  .to-top-container .el-icon-to-top{
    color: #fff;
    display: block;
    line-height: 40px;
    text-align: center;
    font-size: 18px;
  }
  .bounce-enter-active {
    animation: bounce-in .5s;
  }
  .bounce-leave-active {
    animation: bounce-in .5s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
