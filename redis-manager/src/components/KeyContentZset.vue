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
          <el-form-item label="Member">
            <el-input autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Score">
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
        :data="zsetData"
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
          prop="score"
          sortable
          resizable
          label="Score"
          width=150
          >
        </el-table-column>
        <el-table-column
          prop="member"
          resizable
          sortable
          show-overflow-tooltip
          label="Member"
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
        zsetData: [
          {score: 1, member: 'member11111111'},
          {score: 23333, member: 'memberfsadfsd'},
          {score: 44, member: 'memberfdsaf'},
          {score: 765, member: 'memberfasdf'},
          {score: 43, member: 'member1fsdafd1'},
          {score: 66, member: 'memberfsdfsd'},
          {score: 233, member: 'memberggdfdg'},
          {score: 233, member: 'membergds'},
          {score: 233, member: 'member11111111'},
          {score: 233, member: 'member11111111'},
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
            message: row.member + '删除成功!',
            duration: 1000,
          });
        }).catch(() => {
        });
      }
    }
  }
</script>
