<template>
  <div>
    <div>

      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" round @click="dialogFormVisible = true">{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <el-dialog :title="$t('message.add_new_line')" :visible.sync="dialogFormVisible">
        <el-form>
          <el-form-item label="Field">
            <el-input autocomplete="off"></el-input>
          </el-form-item>

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
        :data="hashData"
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
          prop="key"
          sortable
          resizable
          label="Key"
          width=150
          >
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
        hashData: [
          {key: 'key1', value: 'value11111111111111111111111111111111'},
          {key: 'key2', value: 'value222222222222222222222222222222'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
          {key: 'key3', value: 'value3333333333333333333333333'},
        ]
      };
    },
    methods: {
      deleteLine: function (row) {
        this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
          // confirmButtonText: '确定',
          // cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          console.log(row)

          this.$message({
            type: 'success',
            message: row.key + '删除成功!',
            duration: 1000,
          });
        }).catch(() => {
        });
      }
    }
  }
</script>
