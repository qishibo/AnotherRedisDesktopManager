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
            <el-input v-model="newLineItem.field" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Value">
            <el-input type="textarea" :rows="2" v-model="newLineItem.value" autocomplete="off"></el-input>
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
          <el-form-item label="Field">
            <el-input v-model="editLineItem.key" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Value">
            <el-input type="textarea" :rows="2" v-model="editLineItem.value" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

    </div>

    <el-table
        stripe
        :data="hashData"
        style="width: 100%"
        size="small"
        border
        min-height=300
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
        // item {key: xxx, value: xxx}
        hashData: [],
        newLineItem: {},
        beforeEditItem: {},
        editLineItem: {},
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

        client.hgetallAsync(key).then(reply => {
          console.log(reply);
          let hashData = [];

          for (var i in reply) {
            hashData.push({key: i, value: reply[i]});
          }

          this.hashData = hashData;
        });
      },
      showEditDialog(row) {
        this.editLineItem = row;
        this.beforeEditItem = JSON.parse(JSON.stringify(row));
        this.editDialog = true;
      },
      editLine() {
        let key = this.redisKey;
        let client = this.util.get('client');

        let before = this.beforeEditItem;
        let after = this.editLineItem;

        console.log('editing...', before, after);

        client.hsetAsync(key, after.key, after.value).then(reply => {
          console.log('hset...', reply);
        });

        // key changed
        if (before.key !== after.key) {
          client.hdelAsync(key, before.key).then(reply => {
            console.log('key changed, hdel...', reply);
          });
        }

        this.$message.success({
          message: after.key + ' ' + this.$t('message.modify_success'),
          duration: 1000,
        });

        this.initShow();
        this.editDialog = false;
      },
      deleteLine(row) {
        this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
          type: 'warning'
        }).then(() => {
          if (!row.key) {
            return;
          }

          let key = this.redisKey;
          let client = this.util.get('client');
          client.hdelAsync(key, row.key).then(reply => {
            console.log(reply);

            if (reply === 1) {
              this.$message.success({
                message: row.key + ' ' + this.$t('message.delete_success'),
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

        if (!this.newLineItem.field) {
          return;
        }

        client.hsetAsync(key, this.newLineItem.field, this.newLineItem.value).then(reply => {
          console.log(reply);
          if (reply === 1) {
            this.$message.success({
              message: this.newLineItem.field + ' ' + this.$t('message.add_success'),
              duration: 1000,
            });
          }
          else if (reply === 0) {
           this.$message.success({
             message: this.newLineItem.field + ' ' + this.$t('message.modify_success'),
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

<style type="text/css">
  .flex-height {
    position: absolute;
    top: 100px;
    bottom: 0;
    min-height: 300px;
    overflow-y: auto;
  }
</style>
