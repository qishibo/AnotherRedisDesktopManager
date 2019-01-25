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
            <el-input v-model="newLineItem.value" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addLine">确 定</el-button>
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
        // item {key: xxx, value: xxx}
        hashData: [],
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

        client.hgetallAsync(key).then(reply => {
          console.log(reply);
          let hashData = [];

          for (var i in reply) {
            hashData.push({key: i, value: reply[i]});
          }

          this.hashData = hashData;
        });
      },
      deleteLine: function (row) {
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
