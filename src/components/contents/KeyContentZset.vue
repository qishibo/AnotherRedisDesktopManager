<template>
  <div>
    <div>
      <!-- add button -->
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog"  @open='openDialog' :close-on-click-modal='false'>
        <el-form>
          <el-form-item label="Score">
            <el-input v-model="editLineItem.score" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Member">
            <FormatViewer ref='formatViewer' :redisKey="redisKey" :dataMap="editLineItem" :content='editLineItem.member'></FormatViewer>
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
      :data="zsetData">
      <el-table-column
        type="index"
        :label="'ID (Total: ' + total + ')'"
        sortable
        width="150">
      </el-table-column>
      <el-table-column
        prop="score"
        sortable
        resizable
        label="Score"
        width=150>
      </el-table-column>
      <el-table-column
        prop="member"
        resizable
        sortable
        show-overflow-tooltip
        label="Member">
        <template slot-scope="scope">
          {{ $util.cutString($util.bufToString(scope.row.member), 1000) }}
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
          <el-button type="text" @click="$util.copyToClipboard(scope.row.member)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
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
        @click='initShow(false)'
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
      zsetData: [], // {score: 111, member: xxx}
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 100,
      pageIndex: 0,
      searchPageSize: 1000,
      oneTimeListLength: 0,
      scanStream: null,
      loadMoreDisable: false,
    };
  },
  props: ['client', 'redisKey'],
  components: {PaginationTable, FormatViewer, ScrollToTop},
  computed: {
    dialogTitle() {
      return this.beforeEditItem.member ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow(resetTable = true) {
      resetTable && this.resetTable();
      this.loadingIcon = 'el-icon-loading';

      // search mode, scan, random order
      if (this.getScanMatch() != '*') {
        this.getListScan();
      }

      // default mode, ordered
      else {
        this.getListRange(resetTable);
        this.pageIndex++;
      }

      // total lines
      this.initTotal();
    },
    initTotal() {
      this.client.zcard(this.redisKey).then((reply) => {
        this.total = reply;
      }).catch(e => {});
    },
    resetTable() {
      // stop scanning first, #815
      this.scanStream && this.scanStream.pause();
      this.zsetData = [];
      this.pageIndex = 0;
      this.scanStream = null;
      this.oneTimeListLength = 0;
      this.loadMoreDisable = false;
    },
    getListRange(resetTable) {
      let start = this.pageSize * this.pageIndex;
      let end = start + this.pageSize - 1;

      this.client.zrevrangeBuffer([this.redisKey, start, end, 'WITHSCORES']).then((reply) => {
        let zsetData = this.solveList(reply);

        this.zsetData = resetTable ? zsetData : this.zsetData.concat(zsetData);
        (zsetData.length < this.pageSize) && (this.loadMoreDisable = true);
        this.loadingIcon = '';
      }).catch(e => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    getListScan() {
      if (!this.scanStream) {
        this.initScanStream();
      }

      else {
        this.oneTimeListLength = 0;
        this.scanStream.resume();
      }
    },
    initScanStream() {
      const scanOption = {match: this.getScanMatch(), count: this.pageSize};
      scanOption.match != '*' && (scanOption.count = this.searchPageSize);

      this.scanStream = this.client.zscanBufferStream(
        this.redisKey,
        scanOption
      );

      this.scanStream.on('data', reply => {
        let zsetData = this.solveList(reply);

        this.oneTimeListLength += zsetData.length;
        this.zsetData = this.zsetData.concat(zsetData);

        if (this.oneTimeListLength >= this.pageSize) {
          this.scanStream.pause();
          this.loadingIcon = '';
        }
      });

      this.scanStream.on('end', () => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
      });

      this.scanStream.on('error', e => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    solveList(list) {
      if (!list) {
        return [];
      }

      let zsetData = [];

      for (var i = 0; i < list.length; i += 2) {
        zsetData.push({
          score: Number(list[i + 1]),
          member: list[i],
          // memberDisplay: this.$util.bufToString(list[i]),
          uniq: Math.random(),
        });
      }

      return zsetData;
    },
    getScanMatch() {
      return this.filterValue ? `*${this.filterValue}*` : '*';
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
      const lines = item ? [item] : this.zsetData;
      const params = lines.map(line => {
        return `${String(line.score)} ` +
                this.$util.bufToQuotation(line.member);
      });

      const command = `ZADD ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({message: this.$t('message.copy_success'), duration: 800});
    },
    editLine() {
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;

      const afterScore = this.editLineItem.score;
      const afterMember = this.$refs.formatViewer.getContent();

      if (!afterMember || isNaN(afterScore)) {
        return;
      }

      this.editDialog = false;

      client.zadd(
        key,
        afterScore,
        afterMember
      ).then((reply) => {
        // edit key member changed
        if (before.member && !before.member.equals(afterMember)) {
          client.zrem(key, before.member);
        }

        // this.initShow(); // do not reinit, #786
        const newLine = {score: afterScore, member: afterMember, uniq: Math.random()};
        // edit line
        if (this.rowUniq) {
          this.$util.listSplice(this.zsetData, this.rowUniq, newLine);
        }
        // new line
        else {
          this.zsetData.push(newLine);
          this.total++;
        }

        this.$message.success({
          message: reply == 1 ? this.$t('message.add_success') : this.$t('message.modify_success'),
          duration: 1000,
        });
      }).catch(e => {this.$message.error(e.message);});
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' }
      ).then(() => {
        this.client.zrem(
          this.redisKey,
          row.member
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.$util.listSplice(this.zsetData, row.uniq);
            this.total--;
          }
        }).catch(e => {this.$message.error(e.message);});
      }).catch(() => {});
    },
  },
  mounted() {
    this.initShow();
  },
};
</script>
