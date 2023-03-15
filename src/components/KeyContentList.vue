<template>
  <div>
    <div>
      <!-- add button -->
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click='showEditDialog({})'>{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open='openDialog' :close-on-click-modal='false'>
        <el-form>
          <el-form-item label="Value">
            <FormatViewer ref='formatViewer' :redisKey="redisKey" :dataMap="editLineItem" :content='editLineItem.value'></FormatViewer>
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
      border
      size='mini'
      min-height=300
      :data="listData">
      <el-table-column
        type="index"
        :label="'ID (Total: ' + total + ')'"
        sortable
        width="150">
      </el-table-column>
      <el-table-column
        prop="value"
        resizable
        sortable
        show-overflow-tooltip
        label="Value">
        <template slot-scope="scope">
          {{ $util.cutString($util.bufToString(scope.row.value), 1000) }}
        </template>
      </el-table-column>

      <el-table-column label="Operation">
        <template slot="header" slot-scope="scope">
          <input
            class="el-input__inner key-detail-filter-value"
            v-model="filterValue"
            @keyup.enter='initShow()'
            :placeholder="$t('message.key_to_search')"/>
          <i :class='loadingIcon'></i>
        </template>
        <template slot-scope="scope">
          <el-button type="text" @click="$util.copyToClipboard(scope.row.value)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
          <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" :title="$t('message.edit_line')"></el-button>
          <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" :title="$t('el.upload.delete')"></el-button>
          <el-button type="text" @click="dumpCommand(scope.row)" icon="fa fa-code" :title="$t('message.dump_to_clipboard')"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- load more content -->
    <div class='content-more-container'>
      <el-button
        size='mini'
        @click='loadMore'
        :icon='loadingIcon'
        :disabled='loadMoreDisable'
        class='content-more-btn'>
        {{ $t('message.load_more_keys') }}
      </el-button>
    </div>

    <ScrollToTop></ScrollToTop>
  </div>
</template>

<script>
import PaginationTable from '@/components/PaginationTable';
import FormatViewer from '@/components/FormatViewer';
import ScrollToTop from '@/components/ScrollToTop';

export default {
  data() {
    return {
      total: 0,
      filterValue: '',
      editDialog: false,
      listData: [], // {value: xxx}
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 100,
      pageIndex: 0,
      oneTimeListLength: 0,
      loadMoreDisable: false,
    };
  },
  props: ['client', 'redisKey'],
  components: {PaginationTable, FormatViewer, ScrollToTop},
  computed: {
    dialogTitle() {
      return this.beforeEditItem.value ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow(resetTable = true) {
      resetTable && this.resetTable();
      this.loadingIcon = 'el-icon-loading';

      // scan
      this.listScan();
      // total lines
      this.initTotal();
    },
    listScan() {
      const filterValue = this.filterValue;
      const pageSize = filterValue ? 500 : this.pageSize;

      let start = pageSize * this.pageIndex;
      let end = start + pageSize - 1;

      this.client.lrangeBuffer([this.redisKey, start, end]).then((reply) => {
        // scanning end
        if (!reply || !reply.length) {
          this.loadingIcon = '';
          this.loadMoreDisable = true;
          return;
        }

        const listData = [];
        for (const i of reply) {
          if (filterValue) {
            if (!i.includes(filterValue)) {
              continue;
            }
          }

          listData.push({
            value: i,
            uniq: Math.random(),
          });
        }

        this.oneTimeListLength += listData.length;
        this.listData = this.listData.concat(listData);

        if (this.oneTimeListLength >= this.pageSize) {
          this.loadingIcon = '';
          this.oneTimeListLength = 0;
          return;
        }

        if (this.cancelScanning) {
          return;
        }
        // continue scanning until to pagesize
        this.loadMore();
      }).catch(e => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    initTotal() {
      this.client.llen(this.redisKey).then((reply) => {
        this.total = reply;
      }).catch(e => {});
    },
    resetTable() {
      this.listData = [];
      this.pageIndex = 0;
      this.oneTimeListLength = 0;
      this.loadMoreDisable = false;
    },
    loadMore() {
      this.pageIndex++;
      this.listScan();
    },
    openDialog() {
      this.$nextTick(() => {
        this.$refs.formatViewer.autoFormat();
      });
    },
    showEditDialog(row) {
      this.editLineItem = row;
      this.beforeEditItem = this.$util.cloneObjWithBuff(row);
      this.editDialog = true;

      this.rowUniq = row.uniq;
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.listData;
      const params = lines.map(line => {
        return this.$util.bufToQuotation(line.value);
      });

      const command = `RPUSH ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({message: this.$t('message.copy_success'), duration: 800});
    },
    editLine() {
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;
      const afterValue = this.$refs.formatViewer.getContent();

      if (!afterValue) {
        return;
      }

      // not changed
      if (before.value && before.value.equals(afterValue)) {
        return this.editDialog = false;
      }

      this.editDialog = false;

      client.rpush(
        key,
        afterValue
      ).then((reply) => {
        // reply return list length if success
        if (reply > 0) {
          // edit key remove previous value
          if (before.value) {
            client.lrem(key, 1, before.value);
          }

          // this.initShow(); // do not reinit, #786
          const newLine = {value: afterValue, uniq: Math.random()};
          // edit line
          if (this.rowUniq) {
            this.$util.listSplice(this.listData, this.rowUniq, newLine);
          }
          // new line
          else {
            this.listData.push(newLine);
            this.total++;
          }

          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }
      }).catch(e => {this.$message.error(e.message);});
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' }
      ).then(() => {
        this.client.lrem(
          this.redisKey,
          1,
          row.value
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.$util.listSplice(this.listData, row.uniq);
            this.total--;
          }
        }).catch(e => {this.$message.error(e.message);});
      }).catch(() => {});
    },
  },
  mounted() {
    this.initShow();
  },
  beforeDestroy() {
    this.cancelScanning = true;
  },
};
</script>
