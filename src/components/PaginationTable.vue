<template>
  <div>
    <el-table
      :data="pagedData"
      stripe
      size="small"
      border
      min-height=300
      >
      <slot name="default"></slot>
    </el-table>

    <el-pagination
      class="pagenation-table-page-container"
      v-if="data.length > pageSize"
      :total="data.length"
      :page-size="pageSize"
      :current-page.sync="pageIndex"
      layout="prev, pager, next"
      background
      >
    </el-pagination>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      pageSize: 100,
      pageIndex: 1,
    };
  },
  props: ['data'],
  computed: {
    pagedData() {
      const start = (this.pageIndex - 1) * this.pageSize;
      return this.data.slice(start, start + this.pageSize);
    },
  },
};
</script>

<style type="text/css">
  .pagenation-table-page-container {
    margin-top: 20px;
  }
</style>
