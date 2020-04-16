<template>
  <div>
    <div>
      <!-- add button -->
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" @click='showEditDialog({})'>{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title='dialogTitle' :visible.sync="editDialog">
        <el-form>
          <el-form-item label="Field">
            <span v-if='editLineItem.binaryK' class='content-binary'>Hex</span>
            <el-input v-model="editLineItem.key" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Value">
            <span v-if='editLineItem.binaryV' class='content-binary'>Hex</span>
            <FormatViewer :content.sync='editLineItem.value'></FormatViewer>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>
    </div>

    <!-- content table -->
    <PaginationTable :data="hashData" :filterValue="filterValue" filterKey="key">
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
import FormatViewer from '@/components/FormatViewer';

export default {
  data() {
    return {
      filterValue: '',
      editDialog: false,
      hashData: [], // {key: xxx, value: xxx}
      beforeEditItem: {},
      editLineItem: {},
    };
  },
  components: {PaginationTable, FormatViewer},
  props: ['client', 'redisKey'],
  computed: {
    dialogTitle() {
      return this.beforeEditItem.key ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow() {
      this.client.hgetallBuffer(this.redisKey).then((reply) => {
        let hashData = [];

        for (let i of reply) {
          hashData.push({
            key: this.$util.bufToString(i[0]),
            value: this.$util.bufToString(i[1]),
            binaryK: !this.$util.bufVisible(i[0]),
            binaryV: !this.$util.bufVisible(i[1]),
          });
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
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;
      const after = this.editLineItem;

      this.editDialog = false;

      if (!after.key || !after.value) {
        return;
      }

      client.hset(
        key,
        before.binaryK ? this.$util.xToBuffer(after.key) : after.key,
        before.binaryV ? this.$util.xToBuffer(after.value) : after.value
      ).then((reply) => {
        // edit key && key changed
        if (before.key && before.key !== after.key) {
          client.hdel(
            key,
            before.binaryK ? this.$util.xToBuffer(before.key) : before.key
          ).then((reply) => {
            this.initShow();
          });
        }

        else {
          this.initShow();
        }

        // reply==1:new field; reply==0 field exists
        this.$message.success({
          message: reply ? this.$t('message.add_success') : this.$t('message.modify_success'),
          duration: 1000,
        });
      });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        {type: 'warning'}
      ).then(() => {
        this.client.hdel(
          this.redisKey,
          row.binaryK ? this.$util.xToBuffer(row.key) : row.key
        ).then((reply) => {
          if (reply === 1) {
            this.$message.success({
              message: `${row.key} ${this.$t('message.delete_success')}`,
              duration: 1000,
            });

            this.initShow();
          }
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.initShow();
  },
};
</script>
