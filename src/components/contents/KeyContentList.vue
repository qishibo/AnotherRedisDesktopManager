<template>
  <div>
    <!-- table toolbar -->
    <div>
      <!-- add button -->
      <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open="openDialog" :close-on-click-modal="false">
        <el-form>
          <el-form-item label="Value">
            <FormatViewer ref="formatViewer" :redisKey="redisKey" :dataMap="editLineItem" :content="editLineItem.value"></FormatViewer>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>
    </div>

    <!-- vxe table must get a container with a fixed height -->
    <div class="content-table-container">
      <vxe-table
        ref="contentTable"
        size="mini" max-height="100%" min-height="72px"
        border="default" stripe show-overflow="title"
        :scroll-y="{enabled: true}"
        :row-config="{isHover: true, height: 34}"
        :column-config="{resizable: true}"
        :empty-text="$t('el.table.emptyText')"
        :data="listData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="value" title="Value" sortable>
          <template v-slot="scope">
            {{ $util.cutString($util.bufToString(scope.row.value), 100) }}
          </template>
        </vxe-column>
        <vxe-column title="Operate" width="166">
          <template slot-scope="scope" slot="header">
            <el-input size="mini"
              :placeholder="$t('message.key_to_search')"
              :suffix-icon="loadingIcon"
              @keyup.native.enter='initShow()'
              v-model="filterValue">
            </el-input>
          </template>
          <template slot-scope="scope">
            <el-button type="text" @click="$util.copyToClipboard(scope.row.value)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
            <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" :title="$t('message.edit_line')"></el-button>
            <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" :title="$t('el.upload.delete')"></el-button>
            <el-button type="text" @click="dumpCommand(scope.row)" icon="fa fa-code" :title="$t('message.dump_to_clipboard')"></el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

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
  </div>
</template>

<script>
import FormatViewer from '@/components/FormatViewer';
import { VxeTable, VxeColumn } from 'vxe-table';

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
      pageSize: 200,
      searchPageSize: 2000,
      pageIndex: 0,
      oneTimeListLength: 0,
      loadMoreDisable: false,
    };
  },
  props: ['client', 'redisKey'],
  components: { FormatViewer, VxeTable, VxeColumn },
  computed: {
    dialogTitle() {
      return this.beforeEditItem.value ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
  },
  watch: {
    listData(newValue, oldValue) {
      // this.$refs.contentTable.refreshScroll()
      // scroll to bottom while loading more
      if (oldValue.length && (newValue.length > oldValue.length)) {
        setTimeout(() => {
          this.$refs.contentTable && this.$refs.contentTable.scrollTo(0, 99999999);
        }, 0);
      }
    }
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
      const { filterValue } = this;
      const pageSize = filterValue ? this.searchPageSize : this.pageSize;

      const start = pageSize * this.pageIndex;
      const end = start + pageSize - 1;

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

          listData.push({ value: i });
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
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    initTotal() {
      this.client.llen(this.redisKey).then((reply) => {
        this.total = reply;
      }).catch((e) => {});
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
      this.editLineItem = this.$util.cloneObjWithBuff(row);
      this.beforeEditItem = row;
      this.editDialog = true;
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.listData;
      const params = lines.map(line => this.$util.bufToQuotation(line.value));

      const command = `RPUSH ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
    },
    editLine() {
      const key = this.redisKey;
      const { client } = this;
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
      const newLine = { value: afterValue };

      // edit line
      if (before.value) {
        // fix #1082, keep list order
        client.linsert(key, 'AFTER', before.value, afterValue).then((reply) => {
          if (reply > 0) {
            client.lrem(key, 1, before.value);
            // this.initShow(); // do not reinit, #786
            this.$set(this.listData, this.listData.indexOf(before), newLine);

            this.$message.success({
              message: this.$t('message.modify_success'),
              duration: 1000,
            });
          }
          // reply == -1, before.value has been removed
          else {
            this.$message.error({
              message: `${this.$t('message.modify_failed')}, ${this.$t('message.value_not_exists')}`,
              duration: 2000,
            });
          }
        }).catch((e) => { this.$message.error(e.message); });
      }
      // new line
      else {
        client.rpush(key, afterValue).then((reply) => {
          if (reply > 0) {
            // this.initShow(); // do not reinit, #786
            this.listData.push(newLine);
            this.total++;

            this.$message.success({
              message: this.$t('message.add_success'),
              duration: 1000,
            });
          }
        }).catch((e) => { this.$message.error(e.message); });
      }
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.lrem(
          this.redisKey,
          1,
          row.value,
        ).then((reply) => {
          if (reply > 0) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.listData.splice(this.listData.indexOf(row), 1);
            this.total--;
          } else {
            this.$message.error({
              message: this.$t('message.delete_failed'),
              duration: 1000,
            });
          }
        }).catch((e) => { this.$message.error(e.message); });
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
