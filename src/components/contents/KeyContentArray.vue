<template>
  <div>
    <!-- table toolbar -->
    <div>
      <!-- add button -->
      <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>

      <!-- show info button -->
      <el-button type="primary" @click="showInfo" icon="el-icon-info">Info</el-button>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open="openDialog" :close-on-click-modal="false">
        <el-form>
          <el-form-item label="Index">
            <el-input v-model="editLineItem.index" type="number" disabled autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Value">
            <FormatViewer ref="formatViewer" :redisKey="redisKey" :dataMap="editLineItem" :content="editLineItem.value"></FormatViewer>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

      <!-- show info dialog -->
      <el-dialog width="520px" title="Array Info" :visible.sync="infoVisible">
        <el-table size="mini" :data="Object.keys(infoDict).map(key => ({ key, value: infoDict[key] }))" max-height="400">
          <el-table-column prop="key" label="Field" width="280"></el-table-column>
          <el-table-column prop="value" label="Value"></el-table-column>
        </el-table>
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
        :data="arrayData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="index" title="Index" sortable width="150"></vxe-column>
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
      infoVisible: false,
      infoDict: {},
      arrayData: [], // [{index: 0, value: xxx}]
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 5,
      scanStart: 0,
      loadMoreDisable: false,
    };
  },
  props: ['client', 'redisKey'],
  components: { FormatViewer, VxeTable, VxeColumn },
  computed: {
    dialogTitle() {
      return this.beforeEditItem.index !== undefined
        ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
  },
  watch: {
    arrayData(newValue, oldValue) {
      // scroll to bottom while loading more
      if (oldValue.length && (newValue.length > oldValue.length)) {
        setTimeout(() => {
          this.$refs.contentTable && this.$refs.contentTable.scrollTo(0, 99999999);
        }, 0);
      }
    },
  },
  methods: {
    initShow(resetTable = true) {
      resetTable && this.resetTable();
      this.loadingIcon = 'el-icon-loading';

      this.initInfo().then(() => {
        this.listScan();
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    initInfo() {
      return this.client.call('ARINFO', this.redisKey).then((reply) => {
        const info = {};
        if (reply && reply.length) {
          for (let i = 0; i < reply.length; i += 2) {
            info[reply[i]] = reply[i + 1];
          }
        }
        this.infoDict = info;
        this.total = Number(info.count) || 0;
      });
    },
    showInfo() {
      this.initInfo().then(() => {
        this.infoVisible = true;
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    listScan() {
      const filterValue = (this.filterValue || '').trim();
      const promise = filterValue
        ? this.client.callBuffer(
          'ARGREP',
          this.redisKey,
          this.scanStart,
          '+', // +means the last index
          'MATCH',
          filterValue,
          'WITHVALUES',
          'LIMIT',
          this.pageSize,
        )
        : this.client.callBuffer(
          'ARSCAN',
          this.redisKey,
          this.scanStart,
          1e8, // Use 1e8 to simulate the last index, and it is best to use ARLEN to obtain it
          'LIMIT',
          this.pageSize,
        );

      promise.then((reply) => {
        const listData = this.solveList(reply);
        this.arrayData = this.arrayData.concat(listData);

        // scan end
        if (listData.length < this.pageSize) {
          this.loadingIcon = '';
          this.loadMoreDisable = true;
          return;
        }

        // next scan start index
        this.scanStart = listData[listData.length - 1].index + 1;
        this.loadingIcon = '';
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    solveList(reply) {
      if (!reply || !reply.length) {
        return [];
      }

      const data = [];
      for (const line of reply) {
        data.push({
          index: parseInt(line[0]),
          value: line[1],
        });
      }

      return data;
    },
    resetTable() {
      this.arrayData = [];
      this.scanStart = 0;
      this.loadMoreDisable = false;
    },
    loadMore() {
      this.loadingIcon = 'el-icon-loading';
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
      const lines = item ? [item] : this.arrayData;
      const params = lines.map(line => `${line.index} ${this.$util.bufToQuotation(line.value)}`);

      const command = `ARMSET ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
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

      // edit line
      if (before.index !== undefined) {
        const afterIndex = Number(this.editLineItem.index);

        client.callBuffer('ARSET', key, afterIndex, afterValue).then(() => {
          this.$set(this.arrayData, this.arrayData.indexOf(before), {
            index: afterIndex,
            value: afterValue,
          });
          this.$message.success({
            message: this.$t('message.modify_success'),
            duration: 1000,
          });
          // this.initInfo();
        }).catch((e) => { this.$message.error(e.message); });
      }
      // new line
      else {
        // add new at ARLEN (max index + 1)
        client.call('ARLEN', key).then((len) => {
          const index = Number(len) || 0;
          return client.callBuffer('ARSET', key, index, afterValue).then(() => {
            this.arrayData.push({ index, value: afterValue });
            this.$message.success({
              message: this.$t('message.add_success'),
              duration: 1000,
            });
            this.total ++;
            // this.initInfo();
          });
        }).catch((e) => { this.$message.error(e.message); });
      }
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.call('ARDEL', this.redisKey, row.index).then((reply) => {
          if (reply > 0) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.arrayData.splice(this.arrayData.indexOf(row), 1);
            this.total--;
            // this.initInfo();
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
};
</script>

<style type="text/css">
</style>
