<template>
  <div>
    <!-- table toolbar -->
    <div>
      <!-- add button -->
      <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>

      <!-- toggle sort type -->
      &nbsp;
      <el-radio-group v-model="sortType" @change="initShow()" :disabled="!!filterValue">
        <el-radio-button label="DESC">
          DESC <i class="fa fa-chevron-down"></i>
        </el-radio-button>
        <el-radio-button label="ASC">
          ASC <i class="fa fa-chevron-up"></i>
        </el-radio-button>
      </el-radio-group>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open="openDialog" :close-on-click-modal="false">
        <el-form>
          <el-form-item label="Score">
            <el-input v-model="editLineItem.score" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Member">
            <FormatViewer ref="formatViewer" :redisKey="redisKey" :dataMap="editLineItem" :content="editLineItem.member"></FormatViewer>
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
        :data="zsetData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="score" title="Score" sortable width="150"></vxe-column>
        <vxe-column field="member" title="Member" sortable>
          <template v-slot="scope">
            {{ $util.cutString($util.bufToString(scope.row.member), 100) }}
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
            <el-button type="text" @click="$util.copyToClipboard(scope.row.member)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
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
        @click='initShow(false)'
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
      zsetData: [], // {score: 111, member: xxx}
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 200,
      pageIndex: 0,
      searchPageSize: 2000,
      oneTimeListLength: 0,
      scanStream: null,
      loadMoreDisable: false,
      sortType: 'DESC',
    };
  },
  props: ['client', 'redisKey'],
  components: { FormatViewer, VxeTable, VxeColumn },
  computed: {
    dialogTitle() {
      return this.beforeEditItem.member ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
  },
  watch: {
    zsetData(newValue, oldValue) {
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
      }).catch((e) => {});
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
      const start = this.pageSize * this.pageIndex;
      const end = start + this.pageSize - 1;
      const sortMethod = this.sortType === 'ASC' ? 'zrangeBuffer' : 'zrevrangeBuffer';

      this.client[sortMethod]([this.redisKey, start, end, 'WITHSCORES']).then((reply) => {
        const zsetData = this.solveList(reply);

        this.zsetData = resetTable ? zsetData : this.zsetData.concat(zsetData);
        (zsetData.length < this.pageSize) && (this.loadMoreDisable = true);
        this.loadingIcon = '';
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    getListScan() {
      if (!this.scanStream) {
        this.initScanStream();
      } else {
        this.oneTimeListLength = 0;
        this.scanStream.resume();
      }
    },
    initScanStream() {
      const scanOption = { match: this.getScanMatch(), count: this.pageSize };
      scanOption.match != '*' && (scanOption.count = this.searchPageSize);

      this.scanStream = this.client.zscanBufferStream(
        this.redisKey,
        scanOption,
      );

      this.scanStream.on('data', (reply) => {
        const zsetData = this.solveList(reply);

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

      this.scanStream.on('error', (e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    solveList(list) {
      if (!list) {
        return [];
      }

      const zsetData = [];

      for (let i = 0; i < list.length; i += 2) {
        zsetData.push({
          score: Number(list[i + 1]),
          member: list[i],
          // memberDisplay: this.$util.bufToString(list[i]),
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
      this.editLineItem = this.$util.cloneObjWithBuff(row);
      this.beforeEditItem = row;
      this.editDialog = true;
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.zsetData;
      const params = lines.map(line => `${String(line.score)} ${
        this.$util.bufToQuotation(line.member)}`);

      const command = `ZADD ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
    },
    editLine() {
      const key = this.redisKey;
      const { client } = this;
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
        afterMember,
      ).then((reply) => {
        // edit key member changed
        if (before.member && !before.member.equals(afterMember)) {
          client.zrem(key, before.member);
        }

        // this.initShow(); // do not reinit, #786
        const newLine = { score: afterScore, member: afterMember };
        // edit line
        if (before.member) {
          this.$set(this.zsetData, this.zsetData.indexOf(before), newLine);
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
      }).catch((e) => { this.$message.error(e.message); });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.zrem(
          this.redisKey,
          row.member,
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.zsetData.splice(this.zsetData.indexOf(row), 1);
            this.total--;
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
