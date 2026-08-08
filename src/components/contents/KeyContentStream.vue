<template>
  <div class="key-content-stream">
    <!-- table toolbar -->
    <div>
      <el-form :inline="true">
        <el-form-item>
          <!-- add button -->
          <el-button type="primary" @click='showEditDialog({id:"*"})'>{{ $t('message.add_new_line') }}</el-button>
          <!-- groups info -->
          <el-button type="primary" @click="initGroups">Groups</el-button>
        </el-form-item>
        <!-- max value -->
        <el-form-item label="Max">
          <el-input v-model="maxId" @keyup.enter.native="initShow" type="primary" placeholder="Max ID, default +" :title='$t("message.enter_to_search")' size="mini">Max</el-input>
        </el-form-item>
        <!-- min value -->
        <el-form-item label="Min">
          <el-input v-model="minId" @keyup.enter.native="initShow" type="primary" placeholder="Min ID, default -" :title='$t("message.enter_to_search")' size="mini">Min</el-input>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open="openDialog" :close-on-click-modal="false">
        <el-form>
          <el-form-item label="ID">
            <InputBinary :disabled="!!beforeEditItem.contentString" :content.sync="editLineItem.id"></InputBinary>
          </el-form-item>

          <el-form-item label="Value (JSON string)">
            <FormatViewer :redisKey="redisKey" :dataMap="editLineItem" :disabled="!!beforeEditItem.contentString" ref="formatViewer" :content="editLineItem.contentString"></FormatViewer>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button v-if='!beforeEditItem.contentString' type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

      <!-- groups info dialog -->
      <el-dialog width='760px' title='Groups' :visible.sync="groupsVisible">
        <el-table
          size='mini'
          ref='groupsTable'
          min-height=300
          @expand-change='initCousumers'
          @row-click='toggleGroupRow'
          :data="groups">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table :data='consumersDict[props.row.name]'>
                <el-table-column width='62px'>
                </el-table-column>
                <el-table-column
                  label="Consumer Name"
                  prop="name">
                </el-table-column>
                <el-table-column
                  label="Pending"
                  prop="pending">
                </el-table-column>
                <el-table-column
                  label="Idle"
                  prop="idle">
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="Group Name"
            prop="name">
          </el-table-column>
          <el-table-column
            label="Consumers"
            prop="consumers">
          </el-table-column>
          <el-table-column
            label="Pending"
            prop="pending">
          </el-table-column>
          <el-table-column
            label="Last Delivered Id"
            prop="last-delivered-id">
          </el-table-column>
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
        :data="lineData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="id" title="ID" sortable></vxe-column>
        <vxe-column field="contentString" title="Value" sortable></vxe-column>
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
            <el-button type="text" @click="$util.copyToClipboard(scope.row.contentString)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
            <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-view" :title="$t('message.detail')"></el-button>
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
import InputBinary from '@/components/InputBinary';
import { VxeTable, VxeColumn } from 'vxe-table';

export default {
  data() {
    return {
      total: 0,
      editDialog: false,
      lineData: [],
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 200,
      searchPageSize: 2000,
      loadMoreDisable: false,
      minId: '-',
      maxId: '+',
      lastId: Buffer.from(''),
      oneTimeListLength: 0,
      filterValue: '',
      groupsVisible: false,
      groups: [],
      consumersDict: {},
    };
  },
  components: { FormatViewer, InputBinary, VxeTable, VxeColumn },
  props: ['client', 'redisKey'],
  computed: {
    dialogTitle() {
      return this.beforeEditItem.contentString ? this.$t('message.detail')
        : this.$t('message.add_new_line');
    },
  },
  watch: {
    lineData(newValue, oldValue) {
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
      const maxId = this.lastId.equals(Buffer.from(''))
        ? (this.maxId ? this.maxId : '+')
        : this.lastId;
      // +1 for padding the repeat
      const pageSize = this.filterValue ? this.searchPageSize
        : (this.lineData.length ? this.pageSize + 1 : this.pageSize);

      this.client.xrevrangeBuffer([
        this.redisKey,
        maxId,
        this.minId ? this.minId : '-',
        'COUNT',
        pageSize,
      ]).then((reply) => {
        if (!reply.length) {
          return this.loadingIcon = '';
        }

        // last line of this page
        const lastLine = reply[reply.length - 1];

        // scanning end
        if (this.lastId.equals(lastLine[0])) {
          this.loadingIcon = '';
          this.oneTimeListLength = 0;
          return;
        }

        const lineData = [];

        for (const stream of reply) {
          const streamId = stream[0];
          const flatDict = stream[1];

          // skip first line, it is repeat with the last one of previous page
          if (this.lastId.equals(streamId)) {
            continue;
          }

          const content = {};
          const line = { id: streamId, content };
          // add key value map
          for (let i = 0; i < flatDict.length; i += 2) {
            content[this.$util.bufToString(flatDict[i])] = this.$util.bufToString(flatDict[i + 1]);
          }

          line.contentString = JSON.stringify(line.content);

          // filter k&v
          if (this.filterValue && !line.contentString.includes(this.filterValue)) {
            continue;
          }
          lineData.push(line);
        }

        // record last id for next load
        this.lastId = lastLine[0];

        this.oneTimeListLength += lineData.length;
        this.lineData = this.lineData.concat(lineData);

        if (this.oneTimeListLength >= this.pageSize) {
          this.loadingIcon = '';
          this.oneTimeListLength = 0;
          return;
        }

        if (this.cancelScanning) {
          return;
        }
        // continue scanning until to pagesize
        this.listScan();
      }).catch((e) => {
        this.loadingIcon = '';
        this.$message.error(e.message);
      });
    },
    initTotal() {
      this.client.xlen(this.redisKey).then((reply) => {
        this.total = reply;
      });
    },
    resetTable() {
      this.lineData = [];
      this.lastId = Buffer.from('');
      this.oneTimeListLength = 0;
      this.loadMoreDisable = false;
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
      const lines = item ? [item] : this.lineData;
      const params = lines.map((line) => {
        const command = `XADD ${this.$util.bufToQuotation(this.redisKey)} ${line.id} `;

        const dicts = [];
        for (const field in line.content) {
          dicts.push(this.$util.bufToQuotation(field), this.$util.bufToQuotation(line.content[field]));
        }

        return `${command} ${dicts.join(' ')}`;
      });

      // reverse: id asc order
      this.$util.copyToClipboard(params.reverse().join('\n'));
      this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
    },
    editLine() {
      const afterId = this.editLineItem.id;
      const afterValue = this.$refs.formatViewer.getContent();

      if (!afterId || !afterValue) {
        return;
      }

      if (!this.$util.isJson(afterValue)) {
        return this.$message.error(this.$t('message.json_format_failed'));
      }

      const mapList = [];
      const jsonObj = JSON.parse(afterValue);

      for (const k in jsonObj) {
        mapList.push(...[k, jsonObj[k]]);
      }

      this.client.xadd(
        this.redisKey,
        afterId,
        mapList,
      ).then((reply) => {
        // reply is id
        if (reply) {
          // this.initShow(); // do not reinit, #786
          const newLine = { id: reply, content: jsonObj, contentString: afterValue };
          this.lineData.unshift(newLine);
          this.total++;
          this.editDialog = false;

          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.xdel(
          this.redisKey,
          row.id,
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.lineData.splice(this.lineData.indexOf(row), 1);
            this.total--;
          }
        });
      }).catch(() => {});
    },
    initGroups() {
      // reset status
      this.groups = [];
      this.consumersDict = {};
      // show dialog
      this.groupsVisible = true;

      this.client.call('XINFO', 'GROUPS', this.redisKey).then((reply) => {
        this.groups = this.formatInfo(reply);
      });
    },
    initCousumers(row, expandedRows) {
      // exec only when opening
      if (!expandedRows.filter(item => item.name === row.name).length) {
        return;
      }

      this.client.call('XINFO', 'CONSUMERS', this.redisKey, row.name).then((reply) => {
        this.$set(this.consumersDict, row.name, this.formatInfo(reply));
      });
    },
    toggleGroupRow(row) {
      this.$refs.groupsTable.toggleRowExpansion(row);
    },
    formatInfo(lines) {
      const formatted = [];

      for (const line of lines) {
        const dict = {};

        for (let j = 0; j < line.length - 1; j += 2) {
          dict[line[j]] = line[j + 1];
        }

        formatted.push(dict);
      }

      return formatted;
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

<style type="text/css">
  /*key content table wrapper*/
  /*less height due to stream top tools*/
  .key-content-stream.key-content-container .content-table-container {
    height: calc(100vh - 232px);
    margin-top: 0px;
  }
</style>
