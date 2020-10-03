<template>
  <div>
    <div>
      <!-- add button -->
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-button size="small" type="primary" @click='showEditDialog({})'>{{ $t('message.add_new_line') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- edit & add dialog -->
      <el-dialog :title='dialogTitle' :visible.sync="editDialog" @open='openDialog' :close-on-click-modal='false'>
        <el-form>
          <el-form-item label="Field">
            <InputBinary :content.sync="editLineItem.key"></InputBinary>
          </el-form-item>

          <el-form-item label="Value">
            <FormatViewer ref='formatViewer' :content.sync='editLineItem.value'></FormatViewer>
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
      size="small"
      border
      min-height=300
      :data="hashData">
      <el-table-column
        type="index"
        :label="'ID (Total: ' + total + ')'"
        sortable
        width="150">
      </el-table-column>
      <el-table-column
        prop="keyDisplay"
        sortable
        resizable
        label="Key"
        width=150
        >
      </el-table-column>
      <el-table-column
        prop="valueDisplay"
        resizable
        sortable
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
          <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" circle></el-button>
          <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" circle></el-button>
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
import PaginationTable from '@/components/PaginationTable';
import FormatViewer from '@/components/FormatViewer';
import InputBinary from '@/components/InputBinary';

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
      pageSize: 30,
      searchPageSize: 1000,
      oneTimeListLength: 0,
      scanStream: null,
      loadMoreDisable: false,
    };
  },
  components: {PaginationTable, FormatViewer, InputBinary},
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
      });
    },
    resetTable() {
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
            keyDisplay: this.$util.bufToString(reply[i]),
            value: reply[i + 1],
            valueDisplay: this.$util.bufToString(reply[i + 1]),
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
    },
    editLine() {
      const key = this.redisKey;
      const client = this.client;
      const before = this.beforeEditItem;
      const after = this.editLineItem;

      this.editDialog = false;

      if (!after.key || !after.value) {
        return;
      }

      client.hset(
        key,
        after.key,
        after.value
      ).then((reply) => {
        // edit key && key changed
        if (before.key && !before.key.equals(after.key)) {
          client.hdel(
            key,
            before.key
          ).then((reply) => {
            this.initShow();
          });
        }

        else {
          this.initShow();
        }

        // reply==1:new field; reply==0 field exists
        this.$message.success({
          message: reply ? this.$t('message.add_success') : this.$t('message.modify_success'),
          duration: 1000,
        });
      });
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
          if (reply === 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.initShow();
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
