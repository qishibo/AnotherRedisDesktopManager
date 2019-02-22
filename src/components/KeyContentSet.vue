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
          <el-form-item label="Value">
            <el-input v-model="newLineItem.value" autocomplete="off"></el-input>
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

    <!-- content table -->
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
        setData: [], // {value: xxx}
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

        client.smembersAsync(key).then(reply => {
          console.log(reply);

          let setData = [];

          for (var i of reply) {
            setData.push({value: i});
          }

          this.setData = setData;
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

        client.sremAsync(key, before.value).then(reply => {
          console.log('srem...', reply);

          client.saddAsync(key, after.value).then(reply => {
            console.log('sadd...', reply);
            this.initShow();
          });
        });

        this.$message.success({
          message: key + ' ' + this.$t('message.modify_success'),
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

          client.sremAsync(key, row.value).then(reply => {
            console.log(reply);

            if (reply === 1) {
              this.$message.success({
                message: this.$t('message.delete_success'),
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

        if (!this.newLineItem.value) {
          return;
        }

        client.saddAsync(key, this.newLineItem.value).then(reply => {
          console.log(reply);

          if (reply === 1) {
            this.$message.success({
              message: this.$t('message.add_success'),
              duration: 1000,
            });
          }

          else if (reply === 0){
            this.$message.error({
              message: this.$t('message.value_exists'),
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
