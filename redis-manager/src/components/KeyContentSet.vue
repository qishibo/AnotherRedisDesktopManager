<template>
  <div>
    <div>

      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" round @click="dialogFormVisible = true">Add New Line</el-button>
        </el-form-item>
      </el-form>

      <el-dialog title="Add New Line" :visible.sync="dialogFormVisible">
        <el-form>
          <el-form-item label="Value">
            <el-input autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog>

    </div>

    <el-table
        stripe
        :data="setData"
        style="width: 100%"
        size="small"
        border
        max-height=300
        >
        <el-table-column
          type="index"
          label="ID"
          sortable
          width="150">
        </el-table-column>
        <el-table-column
          prop="value"
          resizable
          sortable
          show-overflow-tooltip
          label="Value"
          >
        </el-table-column>

        <el-table-column
          label="Operation"
          >
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" circle></el-button>
            <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" circle></el-button>
          </template>
        </el-table-column>

      </el-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dialogFormVisible: false,
        setData: [
          {value: 'valuesettttttttttttttttttttttt'},
          {value: 'valuefasdfsdfdasfdsfds'},
          {value: 'valuenfghjnhdfhfgfhffggfh'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
          {value: 'value3333333333333333333333333'},
        ]
      };
    },

    methods: {
      deleteLine: function (row) {
        this.$confirm('确认删除该行数据？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          console.log(row)

          this.$message({
            type: 'success',
            message: row.value + '删除成功!',
            duration: 1000,
          });
        }).catch(() => {
        });
      }
    }
  }
</script>
