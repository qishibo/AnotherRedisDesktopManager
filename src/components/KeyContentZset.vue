<template>
  <div>
    <div>

      <!-- add button -->
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" @click="dialogFormVisible = true">{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- add dialog -->
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

      <!-- edit dialog -->
      <el-dialog :title="$t('message.edit_line')" :visible.sync="editDialog">
        <el-form>
          <el-form-item label="Member">
            <el-input v-model="editLineItem.member" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Score">
            <el-input v-model="editLineItem.score" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

    </div>

    <!-- content table -->
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
          <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" circle></el-button>
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
        editDialog: false,
        zsetData: [], // {score: 111, member: xxx}
        newLineItem: {},
        beforeEditItem: {},
        editLineItem: {},
      };
    },
    props: ['redisKey'],
    methods: {
      initShow() {
        let key = this.redisKey;
        let client = this.$util.get('client');

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
      showEditDialog(row) {
        this.editLineItem = row;
        this.beforeEditItem = JSON.parse(JSON.stringify(row));
        this.editDialog = true;
      },
      editLine() {
        let key = this.redisKey;
        let client = this.$util.get('client');

        let before = this.beforeEditItem;
        let after = this.editLineItem;

        console.log('editing...', before, after);

        client.zaddAsync(key, after.score, after.member).then(reply => {
          console.log('zadd...', reply);

          // member changed
          if (after.member !== before.member) {
            client.zremAsync(key, before.member).then(reply => {
              console.log('member changed, zrem...', reply);
              this.initShow();
            });
          }

          else {
            this.initShow();
          }
        });

        this.$message.success({
          message: after.member + ' ' + this.$t('message.modify_success'),
          duration: 1000,
        });

        this.editDialog = false;
      },
      deleteLine: function (row) {
        this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
          type: 'warning'
        }).then(() => {
          let key = this.redisKey;
          let client = this.$util.get('client');

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
        console.log('add line', this.newLineItem);

        let key = this.redisKey;
        let client = this.$util.get('client');

        this.dialogFormVisible = false;

        if (!this.newLineItem.member || !this.newLineItem.score) {
          return;
        }

        client.zaddAsync(key, this.newLineItem.score, this.newLineItem.member).then(reply => {
          console.log(reply);

          this.$message.success({
            message: reply ? this.$t('message.add_success') : this.$t('message.modify_success'),
            duration: 1000,
          });

          this.initShow();
        });
      },
    },
    mounted() {
      this.initShow();
    }
  }
</script>
