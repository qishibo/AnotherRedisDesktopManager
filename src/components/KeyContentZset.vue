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
          <el-form-item label="Member">
            <span v-if='editLineItem.binaryM' class='content-binary'>Hex</span>
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
    <PaginationTable :data="zsetData" :filterValue="filterValue" filterKey="member">
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
      zsetData: [], // {score: 111, member: xxx}
      beforeEditItem: {},
      editLineItem: {},
    };
  },
  props: ['client', 'redisKey'],
  components: {PaginationTable},
  computed: {
    dialogTitle() {
      return this.beforeEditItem.member ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow() {
      this.client.zrangeBuffer([this.redisKey, 0, -1, 'WITHSCORES']).then((reply) => {
        let zsetData = [];
        const { length } = reply;

        for (var i = 0; i < length; i += 2) {
          zsetData.push({
            score: Number(reply[i + 1]),
            member: this.$util.bufToString(reply[i]),
            binaryM: !this.$util.bufVisible(reply[i]),
          });
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
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;
      const after = this.editLineItem;

      this.editDialog = false;

      if (!after.member || isNaN(after.score)) {
        return;
      }

      client.zadd(
        key,
        after.score,
        before.binaryM ? this.$util.xToBuffer(after.member) : after.member
      ).then((reply) => {
        // edit key member changed
        if (before.member && before.member !== after.member) {
          client.zrem(
            key,
            before.binaryM ? this.$util.xToBuffer(before.member) : before.member
          ).then((reply) => {
            this.initShow();
          });
        }

        else {
          this.initShow();
        }

        this.$message.success({
          message: reply ? this.$t('message.add_success') : this.$t('message.modify_success'),
          duration: 1000,
        });
      });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' }
      ).then(() => {
        this.client.zrem(
          this.redisKey,
          row.binaryM ? this.$util.xToBuffer(row.member) : row.member
        ).then((reply) => {
          if (reply === 1) {
            this.$message.success({
              message: `${row.member} ${this.$t('message.delete_success')}`,
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
