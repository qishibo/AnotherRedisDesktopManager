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
      v-if="dataAfterFilter.length > pageSize"
      :total="dataAfterFilter.length"
      :page-size="pageSize"
      :current-page.sync="pageIndex"
      layout="total, prev, pager, next"
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
  props: ['data', 'filterKey', 'filterValue'],
  computed: {
    pagedData() {
      const start = (this.pageIndex - 1) * this.pageSize;
      return this.dataAfterFilter.slice(start, start + this.pageSize);
    },
    dataAfterFilter() {
      const filterKey = this.filterKey;
      const filterValue = this.filterValue;

      this.$nextTick(() => {
        this.pageIndex = 1;
      });

      if (!filterValue || !filterKey) {
        return this.data;
      }

      return this.data.filter(line => line[filterKey].toLowerCase().includes(filterValue.toLowerCase()));
    },
  },
};
</script>

<style type="text/css">
  .pagenation-table-page-container {
    margin-top: 20px;
  }
</style>
