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
      lastId: '',
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

      let maxId = this.lastId ? this.lastId : (this.maxId ? this.maxId : '+');

      this.client.xrevrangeBuffer([
        this.redisKey,
        maxId,
        this.minId ? this.minId : '-',
        'COUNT',
        this.pageSize
      ]).then(reply => {
        if (!reply.length) {
          return this.loadingIcon = '';
        }

        let lineData = [];

        for (let stream of reply) {
          let content = {};
          let line = {id: stream[0], content: content, uniq: Math.random()};
          // add key value map
          for (var i = 0; i < stream[1].length; i+=2) {
            content[this.$util.bufToString(stream[1][i])] =
              this.$util.bufToString(stream[1][i+1]);
          }

          line.contentString = JSON.stringify(line.content);
          lineData.push(line);
        }

        // record last id for next load
        this.lastId = reply[reply.length - 1][0];
        // remove the first[repeated with last one of previous page] when append
        this.lineData.length && lineData.shift();

        this.lineData = resetTable ? lineData : this.lineData.concat(lineData);
        this.loadingIcon = '';
      }).catch(e => {
        this.loadingIcon = '';
        this.$message.error(e.message);
      });

      // total lines
      this.initTotal();
    },
    initTotal() {
      this.client.xlen(this.redisKey).then((reply) => {
        this.total = reply;
      });
    },
    resetTable() {
      this.lineData = [];
      this.lastId = '';
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
};
</script>
