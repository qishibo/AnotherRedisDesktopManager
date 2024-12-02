<template>
  <div>
    <!-- table toolbar -->
    <div>
      <!-- add button -->
      <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" @open="openDialog" :close-on-click-modal="false">
        <el-form label-position="top">

          <!-- if ttl support -->
          <el-form-item v-if="ttlSupport" label="Field">
            <el-row :gutter="10">
              <el-col :span="18">
                <InputBinary :content.sync="editLineItem.key" placeholder="Field"></InputBinary>
              </el-col>
              <el-col :span="6">
                <el-input v-model="editLineItem.ttl" placeholder="TTL (-1)" type="number"></el-input>
              </el-col>
            </el-row>
          </el-form-item>

          <!-- common field -->
          <el-form-item v-else label="Field">
            <InputBinary :content.sync="editLineItem.key" placeholder="Field"></InputBinary>
          </el-form-item>

          <el-form-item label="Value">
            <FormatViewer ref="formatViewer" :redisKey="redisKey" :dataMap="editLineItem" :content='editLineItem.value'></FormatViewer>
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
        :data="hashData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="key" title="Key" sortable>
          <template v-slot="scope">
            {{ $util.bufToString(scope.row.key) }}
          </template>
        </vxe-column>
        <vxe-column field="value" title="Value" sortable>
          <template v-slot="scope">
            {{ $util.cutString($util.bufToString(scope.row.value), 100) }}
          </template>
        </vxe-column>
        <vxe-column v-if="ttlSupport" field="ttl" title="TTL" width="100" sortable></vxe-column>
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
import versionCompare from 'node-version-compare';

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
      pageSize: 200,
      searchPageSize: 2000,
      oneTimeListLength: 0,
      scanStream: null,
      loadMoreDisable: false,
    };
  },
  components: {
    FormatViewer, InputBinary, VxeTable, VxeColumn,
  },
  props: ['client', 'redisKey'],
  computed: {
    dialogTitle() {
      return this.beforeEditItem.key ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
    ttlSupport() {
      // avaiable since redis >= 7.4
      return versionCompare(this.client.ardmRedisVersion, '7.4') >= 0;
    },
  },
  watch: {
    hashData(newValue, oldValue) {
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

      if (!this.scanStream) {
        this.initScanStream();
      } else {
        this.oneTimeListLength = 0;
        this.scanStream.resume();
      }

      // total lines
      this.initTotal();
    },
    initTotal() {
      this.client.hlen(this.redisKey).then((reply) => {
        this.total = reply;
      }).catch((e) => {});
    },
    resetTable() {
      // stop scanning first, #815
      this.scanStream && this.scanStream.pause();
      this.hashData = [];
      this.scanStream = null;
      this.oneTimeListLength = 0;
      this.loadMoreDisable = false;
    },
    initTTL(hashData, startIndex = 0) {
      if (!this.ttlSupport || !hashData.length) {
        return;
      }

      const keys = hashData.map(line => line.key);
      this.client.call('HTTL', this.redisKey, 'FIELDS', keys.length, ...keys).then(reply => {
        reply.forEach((ttl, index) => {
          this.hashData[startIndex + index].ttl = parseInt(ttl);
        });
      });
    },
    initScanStream() {
      const scanOption = { match: this.getScanMatch(), count: this.pageSize };
      scanOption.match != '*' && (scanOption.count = this.searchPageSize);

      this.scanStream = this.client.hscanBufferStream(
        this.redisKey,
        scanOption,
      );

      this.scanStream.on('data', (reply) => {
        const hashData = [];

        for (let i = 0; i < reply.length; i += 2) {
          hashData.push({
            key: reply[i],
            // keyDisplay: this.$util.bufToString(reply[i]),
            value: reply[i + 1],
            // valueDisplay: this.$util.bufToString(reply[i + 1]),
            ttl: -1
          });
        }

        const listLength = this.hashData.length;
        this.oneTimeListLength += hashData.length;
        this.hashData = this.hashData.concat(hashData);

        // init hash field ttls
        this.initTTL(hashData, listLength);

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
      const lines = item ? [item] : this.hashData;
      const params = lines.map(line => `${this.$util.bufToQuotation(line.key)} ${
        this.$util.bufToQuotation(line.value)}`);

      const command = `HSET ${this.$util.bufToQuotation(this.redisKey)} ${params.join(' ')}`;
      this.$util.copyToClipboard(command);
      this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
    },
    editLine() {
      const key = this.redisKey;
      const { client } = this;
      const before = this.beforeEditItem;

      const afterKey = this.editLineItem.key;
      const afterValue = this.$refs.formatViewer.getContent();
      const afterTTL = parseInt(this.editLineItem.ttl);

      if (!afterKey || !afterValue) {
        return;
      }

      this.editDialog = false;

      client.hset(
        key,
        afterKey,
        afterValue,
      ).then((reply) => {
        // edit key && key changed
        if (before.key && !before.key.equals(afterKey)) {
          client.hdel(key, before.key);
        }

        // set ttl if supportted
        if (this.ttlSupport && afterTTL > 0) {
          this.client.call('HEXPIRE', key, afterTTL, "FIELDS", 1, afterKey);
        }

        // this.initShow(); // do not reinit, #786
        const newLine = Object.assign(
          {}, before,
          { key: afterKey, value: afterValue, ttl: afterTTL > 0 ? afterTTL : -1}
        );

        // edit line
        if (before.key) {
          this.$set(this.hashData, this.hashData.indexOf(before), newLine);
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
      }).catch((e) => { this.$message.error(e.message); });
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.hdel(
          this.redisKey,
          row.key,
        ).then((reply) => {
          if (reply == 1) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            // this.initShow(); // do not reinit, #786
            this.hashData.splice(this.hashData.indexOf(row), 1);
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
