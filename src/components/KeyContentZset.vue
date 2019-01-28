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
            <el-input v-model="newLineItem.member" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Score">
            <el-input v-model="newLineItem.score" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="addLine">{{ $t('el.messagebox.confirm') }}</el-button>
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
        zsetData: [],
        newLineItem: {},
      };
    },

    props: ['redisKey'],

    methods: {
      initShow() {
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
        });
      },
      deleteLine: function (row) {
        this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
          type: 'warning'
        }).then(() => {

          if (!row.member) {
            return;
          }

          console.log(row)

          let key = this.redisKey;
          let client = this.util.get('client');
          client.zremAsync(key, row.member).then(reply => {
            console.log(reply);

            if (reply === 1) {
              this.$message.success({
                message: row.member + ' ' + this.$t('message.delete_success'),
                duration: 1000,
              });

              this.initShow();
            }
          });

        });
      },
      addLine() {
        let key = this.redisKey;
        let client = this.util.get('client');

        console.log('add line', this.newLineItem);
        this.dialogFormVisible = false;

        if (!this.newLineItem.member || !this.newLineItem.score) {
          return;
        }

        client.zaddAsync(key, this.newLineItem.score, this.newLineItem.member).then(reply => {
          console.log(reply);
          if (reply === 1) {
            this.$message.success({
              message: this.$t('message.add_success'),
              duration: 1000,
            });
          }

          else if (reply === 0){
            this.$message.success({
              message: this.$t('message.modify_success'),
              duration: 1000,
            });
          }

          this.initShow();
        });
      },
    },
    mounted() {
      this.initShow();
    }
  }
</script>
