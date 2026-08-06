<template>
  <div class="key-content-series">
    <!-- table toolbar -->
    <el-form :inline="true" class="ts-toolbar" size="mini">
      <el-form-item>
        <!-- add button -->
        <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>
        <!-- info button -->
        <el-button type="primary" @click="showInfo" icon="el-icon-info">Info</el-button>
      </el-form-item>
      <!-- timestamp range input -->
      <el-form-item label="Timestamp">
        <el-input
          v-model="minTs"
          @keyup.enter.native="initShow"
          placeholder="start (-)"
          :title='$t("message.enter_to_search")'
          class="ts-filter-input">
        </el-input>
        <span class="ts-filter-sep">~</span>
        <el-input
          v-model="maxTs"
          @keyup.enter.native="initShow"
          placeholder="end (+)"
          :title='$t("message.enter_to_search")'
          class="ts-filter-input">
        </el-input>
      </el-form-item>
      <!-- value range input -->
      <el-form-item label="Value">
        <el-input
          v-model="minValue"
          @keyup.enter.native="initShow"
          placeholder="min (-inf)"
          :title='$t("message.enter_to_search")'
          class="ts-filter-input">
        </el-input>
        <span class="ts-filter-sep">~</span>
        <el-input
          v-model="maxValue"
          @keyup.enter.native="initShow"
          placeholder="max (+inf)"
          :title='$t("message.enter_to_search")'
          class="ts-filter-input">
        </el-input>
      </el-form-item>
    </el-form>

    <!-- edit & add dialog -->
    <el-dialog :title="dialogTitle" :visible.sync="editDialog" :close-on-click-modal="false">
      <el-form>
        <el-form-item label="Timestamp (ms)">
          <el-input
            v-model="editLineItem.timestamp"
            :disabled="isEdit"
            placeholder="* or unix ms timestamp"
            autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item label="Value (number)">
          <el-input v-model="editLineItem.value" type="number" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- show info dialog -->
    <el-dialog width="520px" title="TimeSeries Info" :visible.sync="infoVisible">
      <el-table size="mini" :data="Object.keys(infoDict).map(key => ({ key, value: infoDict[key] }))" max-height="400">
        <el-table-column prop="key" label="Field" width="280"></el-table-column>
        <el-table-column prop="value" label="Value"></el-table-column>
      </el-table>
    </el-dialog>

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
        :data="tsData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="timestamp" title="Timestamp" sortable>
          <template v-slot="scope">
            <span :title="formatTime(scope.row.timestamp)">{{ scope.row.timestamp }}</span>
          </template>
        </vxe-column>
        <vxe-column field="value" title="Value" sortable></vxe-column>
        <vxe-column title="Operate" width="166">
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
import { VxeTable, VxeColumn } from 'vxe-table';

export default {
  data() {
    return {
      total: 0,
      editDialog: false,
      infoVisible: false,
      infoDict: {},
      tsData: [], // [{timestamp, value}]
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 4,
      minTs: '-',
      maxTs: '+',
      minValue: '',
      maxValue: '',
      lastTs: null,
      loadMoreDisable: false,
    };
  },
  props: ['client', 'redisKey'],
  components: { VxeTable, VxeColumn },
  computed: {
    isEdit() {
      return this.beforeEditItem.timestamp !== undefined;
    },
    dialogTitle() {
      return this.isEdit
        ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
  },
  watch: {
    tsData(newValue, oldValue) {
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
      return this.client.call('TS.INFO', this.redisKey).then((reply) => {
        const info = {};
        if (reply && reply.length) {
          for (let i = 0; i < reply.length; i += 2) {
            info[reply[i]] = reply[i + 1];
          }
        }
        this.infoDict = info;
        this.total = Number(info.totalSamples) || 0;
      });
    },
    showInfo() {
      this.initInfo().then(() => {
        this.infoVisible = true;
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    buildRevrangeArgs(maxTs) {
      const minTs = this.minTs.trim() || '-';
      const args = [
        'TS.REVRANGE',
        this.redisKey,
        minTs,
        maxTs,
      ];

      // value filterd
      const minValue = this.minValue.trim() || '-inf';
      const maxValue = this.maxValue.trim() || '+inf';
      if (minValue || maxValue) {
        args.push(
          'FILTER_BY_VALUE',
          minValue,
          maxValue,
        );
      }

      // count limit
      args.push('COUNT', this.pageSize);
      return args;
    },
    listScan() {
      const maxTs = this.lastTs === null
                    ? (this.maxTs.trim() || '+') // first page
                    : this.lastTs - 1; // load more

      this.client.call(...this.buildRevrangeArgs(maxTs)).then((reply) => {
        const listData = this.solveList(reply);
        this.tsData = this.tsData.concat(listData);

        // scan end
        if (listData.length < this.pageSize) {
          this.loadingIcon = '';
          this.loadMoreDisable = true;
          return;
        }

        // next scan ts
        this.lastTs = listData[listData.length - 1].timestamp;
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
          timestamp: parseInt(line[0]),
          value: line[1],
        });
      }

      return data;
    },
    resetTable() {
      this.tsData = [];
      this.lastTs = null;
      this.loadMoreDisable = false;
    },
    loadMore() {
      this.loadingIcon = 'el-icon-loading';
      this.listScan();
    },
    formatTime(ts) {
      try {
        return new Date(Number(ts)).toLocaleString();
      } catch (e) {
        return '';
      }
    },
    showEditDialog(row) {
      this.editLineItem = Object.assign({ timestamp: '*', value: '0' }, row);
      this.beforeEditItem = row;
      this.editDialog = true;
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.tsData;
      const key = this.$util.bufToQuotation(this.redisKey);
      const params = lines.map(line => `TS.ADD ${key} ${line.timestamp} ${line.value}`);

      this.$util.copyToClipboard(params.join('\n'));
      this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
    },
    editLine() {
      const key = this.redisKey;
      const { client } = this;
      const before = this.beforeEditItem;
      const timestamp = String(this.editLineItem.timestamp).trim();
      const value = String(this.editLineItem.value).trim();

      if (!timestamp || value === '') {
        return;
      }

      // not changed
      if (this.isEdit && before.value === value) {
        return this.editDialog = false;
      }

      this.editDialog = false;

      // edit line
      if (this.isEdit) {
        client.call('TS.ADD', key, timestamp, value, 'ON_DUPLICATE', 'LAST').then(() => {
          this.$set(this.tsData, this.tsData.indexOf(before), {
            timestamp: Number(timestamp),
            value: value,
          });
          this.$message.success({
            message: this.$t('message.modify_success'),
            duration: 1000,
          });
        }).catch((e) => { this.$message.error(e.message); });
      }
      // new line
      else {
        client.call('TS.ADD', key, timestamp, value).then((reply) => {
          this.tsData.unshift({ timestamp: Number(reply), value });
          this.total++;
          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }).catch((e) => { this.$message.error(e.message); });
      }
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.call('TS.DEL', this.redisKey, row.timestamp, row.timestamp).then((reply) => {
          if (reply > 0) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.tsData.splice(this.tsData.indexOf(row), 1);
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
};
</script>

<style type="text/css">
  .key-content-series .ts-toolbar .el-form-item {
    margin-bottom: 10px;
  }
  .key-content-series .ts-toolbar .el-form-item__label {
    padding-left: 5px;
    padding-right: 6px;
  }
  .key-content-series .ts-toolbar .ts-filter-input {
    width: 80px;
  }
  .key-content-series .ts-toolbar .ts-filter-input .el-input__inner {
    padding: 0 6px;
  }
  .key-content-series .ts-toolbar .ts-filter-sep {
    margin: 0 4px;
    color: #c0c4cc;
  }
</style>
