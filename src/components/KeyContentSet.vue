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
    <PaginationTable :data="setData" :filterValue="filterValue" filterKey="value">
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
        label="Value">
      </el-table-column>

      <el-table-column label="Operation">
        <template slot="header" slot-scope="scope">
          <input
            class="el-input__inner key-detail-filter-value"
            v-model="filterValue"
            :placeholder="$t('message.key_to_search')"
            />
        </template>
        <template slot-scope="scope">
          <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" circle></el-button>
          <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" circle></el-button>
        </template>
      </el-table-column>
    </PaginationTable>
  </div>
</template>

<script>
import PaginationTable from '@/components/PaginationTable';

export default {
  data() {
    return {
      filterValue: '',
      dialogFormVisible: false,
      editDialog: false,
      setData: [], // {value: xxx}
      newLineItem: {},
      beforeEditItem: {},
      editLineItem: {},
    };
  },
  props: ['client', 'redisKey', 'syncKeyParams'],
  components: {PaginationTable},
  methods: {
    initShow() {
      const key = this.syncKeyParams.keyName;

      if (!key) {
        return;
      }

      this.client.smembersAsync(key).then((reply) => {
        const setData = [];

        for (const i of reply) {
          setData.push({ value: i });
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
      const key = this.syncKeyParams.keyName;
      const client = this.client;

      const before = this.beforeEditItem;
      const after = this.editLineItem;

      client.sremAsync(key, before.value).then((reply) => {
        client.saddAsync(key, after.value).then((reply) => {
          this.initShow();
        });
      });

      this.$message.success({
        message: `${key} ${this.$t('message.modify_success')}`,
        duration: 1000,
      });

      this.editDialog = false;
    },
    deleteLine(row) {
      this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
        type: 'warning',
      }).then(() => {
        const key = this.syncKeyParams.keyName;

        this.client.sremAsync(key, row.value).then((reply) => {
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
      const key = this.syncKeyParams.keyName;
      const ttl = this.syncKeyParams.keyTTL;
      const client = this.client;

      this.dialogFormVisible = false;

      if (!key) {
        this.$parent.$parent.emptyKeyWhenAdding();
        return false;
      }

      if (!this.newLineItem.value) {
        return;
      }

      client.saddAsync(key, this.newLineItem.value).then((reply) => {
        if (reply === 1) {
          if (ttl > 0) {
            client.expireAsync(key, ttl).then((reply) => {});
          }

          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }
        else if (reply === 0) {
          this.$message.error({
            message: this.$t('message.value_exists'),
            duration: 1000,
          });
        }

        // if in new key mode, exec refreshAfterAdd
        this.redisKey ? this.initShow() : this.$parent.$parent.refreshAfterAdd(key);
      });
    },
  },
  mounted() {
    this.initShow();
  },
};
</script>
