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
        // item {score: 111, member: xxx}
        zsetData: []
      };
    },

    props: ['redisKey'],

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
    },
    mounted() {
      let key = this.redisKey;
      let client = this.util.get('client');

      if (!key) {
        return;
      }

      client.zrangeAsync([key, 0, -1, 'WITHSCORES']).then(reply => {
        console.log(reply);
        let zsetData = [];
        var length = reply.length;

        for (var i = 0; i < (length - 1); i++) {
          if (!(i % 2)) {
            zsetData.push({member: reply[i], score: reply[i + 1]});
          }
        }

        this.zsetData = zsetData;
      })
    }
  }
</script>
