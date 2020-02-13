<template>
  <!-- page -->
  <div class="pagenation">
    <el-button ref="pagePreButton" type="text" @click="pagePre()" :disabled="pageIndex<=1" size="mini" icon="el-icon-arrow-left"></el-button>
    <input
      :value="pageIndex"
      ref='pageIndexInput'
      @click="$event.target.select()"
      @keyup.enter="jumpToPage($event.target.value)"
      class="page-jumper el-input__inner"
      type="number"
      min="1"
      step="1">
    </input>
    <el-button ref="pageNextButton" type="text" @click="pageNext()" :disabled="nextPageDisabled" size="mini" icon="el-icon-arrow-right"></el-button>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      pageIndex: 1,
      nextPageDisabled: false,
    };
  },
  props: ['client'],
  methods: {
    pagePre() {
      if (--this.pageIndex < 1) {
        this.pageIndex = 1;
      }

      this.refreshKeyList(false);
    },
    pageNext() {
      const cursorListLength = this.getScanCursorList().length;
      this.refreshKeyList(++this.pageIndex >= cursorListLength);
    },
    jumpToPage(targetPage) {
      targetPage = parseInt(targetPage);

      if (isNaN(targetPage) || targetPage <= 0) {
        this.$refs.pageIndexInput.value = 1;
        targetPage = 1;
      }

      const nowPage = this.pageIndex;
      const cursorListLength = this.getScanCursorList().length;

      if (targetPage >= cursorListLength) {
        // to biggest page index
        this.pageIndex = (cursorListLength <= 1) ? 1 : (cursorListLength - 1)
        const recursiveResult = this.pageNextRecursive(targetPage);

        // last page
        if (recursiveResult === false) {
          this.$refs.pageIndexInput.value = this.pageIndex;

          this.$message.error({
            message: this.$t('message.max_page_reached'),
            duration: 2000,
          });
        }
      } else {
        this.pageIndex = targetPage
        this.refreshKeyList(false);
      }
    },
    pageNextRecursive(targetPage) {
      const cursorList = this.getScanCursorList();
      const cursorListLength = cursorList.length;

      // last page
      if (cursorList[cursorListLength - 1] == '0') {
        return false;
      }

      if (this.pageIndex < targetPage) {
        this.pageIndex++;

        this.refreshKeyList(this.pageIndex >= cursorListLength).then(() => {
          this.pageNextRecursive(targetPage);
        });
      }
    },
    getScanCursorList() {
      return this.$parent.$refs.keyList.scanCursorList;
    },
    refreshKeyList(pushToCursorList = true) {
      return this.$parent.$refs.keyList.refreshKeyList(pushToCursorList);
    },
  },
}
</script>

<style type="text/css">
  .pagenation {
    margin-top: 10px;
  }
  .pagenation .page-jumper {
    width: 40px;
    height: 24px;
    padding: 5px;
    font-size: 12px;
    margin: 0 10px;
    text-align: center;
  }

  .pagenation input::-webkit-outer-spin-button,
  .pagenation input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
</style>
