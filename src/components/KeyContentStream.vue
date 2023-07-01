<template>
  <div>
    <div>
      <el-form :inline="true">
        <!-- add button -->
        <el-form-item>
          <el-button type="primary" @click='showEditDialog({id:"*"})'>{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
        <!-- max value -->
        <el-form-item label="Max">
          <el-input v-model="maxId" @keyup.enter.native='initShow' type="primary" placeholder='Max ID, default +' :title='$t("message.enter_to_search")' size='mini'>Max</el-input>
        </el-form-item>
        <!-- min value -->
        <el-form-item label="Min">
          <el-input v-model="minId" @keyup.enter.native='initShow' type="primary" placeholder='Min ID, default -' :title='$t("message.enter_to_search")' size='mini'>Min</el-input>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title='dialogTitle' :visible.sync="editDialog" @open='openDialog' :close-on-click-modal='false'>
        <el-form>
          <el-form-item label="ID">
            <InputBinary :disabled='!!beforeEditItem.contentString' :content.sync="editLineItem.id"></InputBinary>
          </el-form-item>

          <el-form-item label="Value (JSON string)">
            <FormatViewer :redisKey="redisKey" :dataMap="editLineItem" :disabled='!!beforeEditItem.contentString' ref='formatViewer' :content='editLineItem.contentString'></FormatViewer>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button v-if='!beforeEditItem.contentString' type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>
    </div>

    <!-- content table -->
    <el-table
      stripe
      border
      size='mini'
      min-height=300
      :data="lineData">
      <el-table-column
        type="index"
        :label="'NO. (Total: ' + total + ')'"
        sortable
        width="150">
      </el-table-column>
      <el-table-column
        prop="id"
        sortable
        resizable
        label="ID"
        >
        <template slot-scope="scope">
          <span>{{ $util.bufToString(scope.row.id) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="contentString"
        resizable
        show-overflow-tooltip
        label="Value"
        >
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
          <el-button type="text" @click="$util.copyToClipboard(JSON.stringify(scope.row.content))" icon="el-icon-document" :title="$t('message.copy')"></el-button>
          <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-view" :title="$t('message.detail')"></el-button>
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
  </div>
</template>

<script>
import FormatViewer from '@/components/FormatViewer';
import InputBinary from '@/components/InputBinary';

export default {
  data() {
    return {
      total: 0,
      editDialog: false,
      lineData: [],
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 100,
      loadMoreDisable: false,
      minId: '-',
      maxId: '+',
      lastId: Buffer.from(''),
      oneTimeListLength: 0,
      filterValue: '',
    };
  },
  components: {FormatViewer, InputBinary},
  props: ['client', 'redisKey'],
  computed: {
    dialogTitle() {
      return this.beforeEditItem.contentString ? this.$t('message.detail') :
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
      let maxId = this.lastId.equals(Buffer.from('')) ?
                  (this.maxId ? this.maxId : '+') :
                  this.lastId;
      // +1 for padding the repeat
      const pageSize = this.filterValue ? 500 :
                      (this.lineData.length ? this.pageSize + 1 : this.pageSize);

      this.client.xrevrangeBuffer([
        this.redisKey,
        maxId,
        this.minId ? this.minId : '-',
        'COUNT',
        pageSize
      ]).then(reply => {
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

        let lineData = [];

        for (let stream of reply) {
          const streamId = stream[0];
          const flatDict = stream[1];

          // skip first line, it is repeat with the last one of previous page
          if (this.lastId.equals(streamId)) {
            continue;
          }

          let content = {};
          let line = {id: streamId, content: content, uniq: Math.random()};
          // add key value map
          for (var i = 0; i < flatDict.length; i+=2) {
            content[this.$util.bufToString(flatDict[i])] =
              this.$util.bufToString(flatDict[i+1]);
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
      }).catch(e => {
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
      this.editLineItem = row;
      this.beforeEditItem = this.$util.cloneObjWithBuff(row);
      this.editDialog = true;
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.lineData;
      const params = lines.map(line => {
        let command = `XADD ${this.$util.bufToQuotation(this.redisKey)} ${line.id} `;
        
        let dicts = [];
        for (const field in line.content) {
          dicts.push(this.$util.bufToQuotation(field), this.$util.bufToQuotation(line.content[field]));
        }

        return `${command} ${dicts.join(' ')}`;
      });

      // reverse: id asc order
      this.$util.copyToClipboard(params.reverse().join('\n'));
      this.$message.success({message: this.$t('message.copy_success'), duration: 800});
    },
    editLine() {
      const afterId = this.editLineItem.id
      const afterValue = this.$refs.formatViewer.getContent();

      if (!afterId || !afterValue) {
        return;
      }

      if (!this.$util.isJson(afterValue)) {
        return this.$message.error(this.$t('message.json_format_failed'));
      }

      let mapList = [];
      let jsonObj = JSON.parse(afterValue);

      for (let k in jsonObj) {
        mapList.push(...[k, jsonObj[k]]);
      }

      this.client.xadd(
        this.redisKey,
        afterId,
        mapList
      ).then((reply) => {
        // reply is id
        if (reply) {
          this.initShow();
          this.editDialog = false;

          this.$message.success({
            message: this.$t('message.add_success'),
            duration: 1000,
          });
        }
      }).catch(e => {
        this.$message.error(e.message);
      });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        {type: 'warning'}
      ).then(() => {
        this.client.xdel(
          this.redisKey,
          row.id
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.$util.listSplice(this.lineData, row.uniq);
            this.total--;
          }
        });
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
