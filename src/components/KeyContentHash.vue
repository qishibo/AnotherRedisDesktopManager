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
      <el-dialog :title='dialogTitle' :visible.sync="editDialog" @open='openDialog' :close-on-click-modal='false'>
        <el-form>
          <el-form-item label="Field">
            <InputBinary :content.sync="editLineItem.key"></InputBinary>
          </el-form-item>

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
      :data="hashData">
      <el-table-column
        type="index"
        :label="'ID (Total: ' + total + ')'"
        sortable
        width="150">
      </el-table-column>
      <el-table-column
        prop="key"
        sortable
        resizable
        label="Key"
        show-overflow-tooltip
        width="150">
        <template slot-scope="scope">
          {{ $util.bufToString(scope.row.key) }}
        </template>
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
import InputBinary from '@/components/InputBinary';
import ScrollToTop from '@/components/ScrollToTop';

export default {
  data() {
    return {
      total: 0,
      filterValue: '',
      editDialog: false,
      hashData: [], // {key: xxx, value: xxx}
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 100,
      searchPageSize: 1000,
      oneTimeListLength: 0,
      scanStream: null,
      loadMoreDisable: false,
    };
  },
  components: {PaginationTable, FormatViewer, InputBinary, ScrollToTop},
  props: ['client', 'redisKey'],
  computed: {
    dialogTitle() {
      return this.beforeEditItem.key ? this.$t('message.edit_line') :
             this.$t('message.add_new_line');
    },
  },
  methods: {
    initShow(resetTable = true) {
      resetTable && this.resetTable();
      this.loadingIcon = 'el-icon-loading';

      if (!this.scanStream) {
        this.initScanStream();
      }

      else {
        this.oneTimeListLength = 0;
        this.scanStream.resume();
      }

      // total lines
      this.initTotal();
    },
    initTotal() {
      this.client.hlen(this.redisKey).then((reply) => {
        this.total = reply;
      }).catch(e => {});
    },
    resetTable() {
      // stop scanning first, #815
      this.scanStream && this.scanStream.pause();
      this.hashData = [];
      this.scanStream = null;
      this.oneTimeListLength = 0;
      this.loadMoreDisable = false;
    },
    initScanStream() {
      const scanOption = {match: this.getScanMatch(), count: this.pageSize};
      scanOption.match != '*' && (scanOption.count = this.searchPageSize);

      this.scanStream = this.client.hscanBufferStream(
        this.redisKey,
        scanOption
      );

      this.scanStream.on('data', reply => {
        let hashData = [];

        for (let i = 0; i < reply.length; i += 2) {
          hashData.push({
            key: reply[i],
            // keyDisplay: this.$util.bufToString(reply[i]),
            value: reply[i + 1],
            // valueDisplay: this.$util.bufToString(reply[i + 1]),
            uniq: Math.random(),
          });
        }

        this.oneTimeListLength += hashData.length;
        this.hashData = this.hashData.concat(hashData);

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
      const lines = item ? [item] : this.hashData;
      const params = lines.map(line => {
        return `${this.$util.bufToQuotation(line.key)} ` +
               this.$util.bufToQuotation(line.value);
      });

      const command = `HMSET ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({message: this.$t('message.copy_success'), duration: 800});
    },
    editLine() {
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;

      const afterKey = this.editLineItem.key;
      const afterValue = this.$refs.formatViewer.getContent();

      if (!afterKey || !afterValue) {
        return;
      }

      this.editDialog = false;

      client.hset(
        key,
        afterKey,
        afterValue
      ).then((reply) => {
        // edit key && key changed
        if (before.key && !before.key.equals(afterKey)) {
          client.hdel(key, before.key);
        }

        // this.initShow(); // do not reinit, #786
        const newLine = {key: afterKey, value: afterValue, uniq: Math.random()};
        // edit line
        if (this.rowUniq) {
          this.$util.listSplice(this.hashData, this.rowUniq, newLine);
        }
        // new line
        else {
          this.hashData.push(newLine);
          this.total++;
        }

        // reply==1:new field; reply==0 field exists
        this.$message.success({
          message: reply == 1 ? this.$t('message.add_success') : this.$t('message.modify_success'),
          duration: 1000,
        });
      }).catch(e => {this.$message.error(e.message);});
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        {type: 'warning'}
      ).then(() => {
        this.client.hdel(
          this.redisKey,
          row.key
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.$util.listSplice(this.hashData, row.uniq);
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
