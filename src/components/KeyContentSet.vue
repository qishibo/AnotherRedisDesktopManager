<template>
  <div>
    <div>
      <!-- add button -->
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog">
        <el-form>
          <el-form-item label="Value">
            <el-input type="textarea" :rows="6" v-model="editLineItem.value" autocomplete="off"></el-input>
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
      editDialog: false,
      setData: [], // {value: xxx}
      beforeEditItem: {},
      editLineItem: {},
    };
  },
  props: ['client', 'redisKey', 'syncKeyParams'],
  components: {PaginationTable},
  computed: {
    dialogTitle() {
      return this.beforeEditItem.value ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow() {
      const key = this.syncKeyParams.keyName;

      if (!key) {
        return;
      }

      this.client.smembers(key).then((reply) => {
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
      const ttl = this.syncKeyParams.keyTTL;
      const client = this.client;

      this.editDialog = false;

      if (!key) {
        this.$parent.$parent.emptyKeyWhenAdding();
        return;
      }

      const before = this.beforeEditItem;
      const after = this.editLineItem;

      if (!after.value || before.value == after.value) {
        return;
      }

      client.sadd(key, after.value).then((reply) => {
        // add success
        if (reply === 1) {
          // new key set ttl
          if (!this.redisKey && ttl > 0) {
            client.expire(key, ttl).then(() => {});
          }

          // edit key remove previous value
          if (before.value) {
            client.srem(key, before.value).then((reply) => {
              this.initShow();
            });
          }

          else {
            // if in new key mode, exec refreshAfterAdd
            this.redisKey ? this.initShow() : this.$parent.$parent.refreshAfterAdd(key);
          }

          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }

        // value exists
        else if (reply === 0) {
          this.$message.error({
            message: this.$t('message.value_exists'),
            duration: 1000,
          });
        }
      });
    },
    deleteLine(row) {
      this.$confirm(this.$t('message.confirm_to_delete_row_data'), {
        type: 'warning',
      }).then(() => {
        const key = this.syncKeyParams.keyName;

        this.client.srem(key, row.value).then((reply) => {
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
  },
  mounted() {
    this.initShow();
  },
};
</script>
