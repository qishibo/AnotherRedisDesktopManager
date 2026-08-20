<template>
  <div class="key-content-vector">
    <!-- table toolbar -->
    <div>
      <!-- add button -->
      <el-button type="primary" @click="showEditDialog({})">{{ $t('message.add_new_line') }}</el-button>
      <!-- info button -->
      <el-button type="primary" @click="showInfo" icon="el-icon-info">Info</el-button>
      <!-- similarity calc -->
      <el-button type="primary" @click="openSimDialog()">Similarity</el-button>

      <!-- edit & add dialog -->
      <el-dialog :title="dialogTitle" :visible.sync="editDialog" :close-on-click-modal="false">
        <el-form label-position="top" size="mini">
          <el-form-item label="Element">
            <el-input v-model="editLineItem.element" :disabled="isEdit" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Vector (comma separated)">
            <el-input
              type="textarea"
              :rows="4"
              v-model="editLineItem.vectorText"
              placeholder="vectors such as 0.111, 0.222, 0.333">
            </el-input>
            <div v-if="dim" class="vector-dim-hint">Dimension: {{ dim }}</div>
          </el-form-item>
          <el-form-item label="Attributes (JSON, optional)">
            <el-input
              type="textarea"
              :rows="3"
              v-model="editLineItem.attrs"
              placeholder='{"category":"demo"}'>
            </el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button type="primary" @click="editLine">{{ $t('el.messagebox.confirm') }}</el-button>
        </div>
      </el-dialog>

      <!-- info dialog -->
      <el-dialog width="520px" title="Vector Info" :visible.sync="infoVisible">
        <el-table size="mini" :data="Object.keys(infoDict).map(key => ({ key, value: infoDict[key] }))" max-height="400">
          <el-table-column prop="key" label="Field" width="280"></el-table-column>
          <el-table-column prop="value" label="Value"></el-table-column>
        </el-table>
      </el-dialog>

      <!-- similarity dialog -->
      <el-dialog width="720px" title="Similarity Search" :visible.sync="simVisible" :close-on-click-modal="false">
        <el-form label-position="top" size="mini">
          <!-- toggle tab -->
          <el-form-item label="Query Mode">
            <el-radio-group v-model="simMode">
              <el-radio-button label="ele">By Element</el-radio-button>
              <el-radio-button label="values">By Vector</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!-- by element name -->
          <el-form-item v-if="simMode === 'ele'" label="Element">
            <el-input v-model="simElement" placeholder="existing element name"></el-input>
          </el-form-item>
          <!-- by vector -->
          <el-form-item v-else label="Vector (comma separated)">
            <el-input type="textarea" :rows="2" v-model="simVectorText" placeholder="vectors such as 0.111, 0.222, 0.333"></el-input>
            <div v-if="dim" class="vector-dim-hint">Dimension: {{ dim }}</div>
          </el-form-item>
          <!-- search count -->
          <el-form-item label="COUNT">
            <el-input-number v-model="simCount" :min="1" :max="200"></el-input-number>&nbsp;
            <el-button type="primary" size="mini" :loading="simLoading" @click="runSimilarity">Search</el-button>
          </el-form-item>
        </el-form>

        <!-- simility result table -->
        <el-table size="mini" :data="simResults" max-height="340" border stripe>
          <el-table-column type="index" label="ID" width="50"></el-table-column>
          <el-table-column prop="element" label="Element"></el-table-column>
          <el-table-column prop="score" label="Score" width="160"></el-table-column>
          <el-table-column prop="attrs" label="Attributes" min-width="180">
            <template slot-scope="scope">
              {{ $util.cutString(scope.row.attrs || '-', 80) }}
            </template>
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
        :data="vectorData">
        <vxe-column type="seq" :title="'ID (Total: ' + total + ')'" width="150"></vxe-column>
        <vxe-column field="element" title="Element" sortable>
          <template v-slot="scope">
            {{ $util.cutString(scope.row.element, 100) }}
          </template>
        </vxe-column>
        <vxe-column title="Operate" width="200">
          <template slot-scope="scope" slot="header">
            <el-input size="mini"
              placeholder="Prefix search"
              :suffix-icon="loadingIcon"
              @keyup.native.enter='initShow()'
              v-model="filterValue">
            </el-input>
          </template>
          <template slot-scope="scope">
            <el-button type="text" @click="$util.copyToClipboard(scope.row.element)" icon="el-icon-document" :title="$t('message.copy')"></el-button>
            <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" :title="$t('message.edit_line')"></el-button>
            <el-button type="text" @click="openSimDialog(scope.row)" icon="el-icon-search" title="Similarity"></el-button>
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
import versionCompare from 'node-version-compare';

export default {
  data() {
    return {
      total: 0,
      dim: 0,
      filterValue: '',
      editDialog: false,
      infoVisible: false,
      infoDict: {},
      vectorData: [], // [{element}]
      beforeEditItem: {},
      editLineItem: {},
      loadingIcon: '',
      pageSize: 200,
      vrangeStart: '-',
      loadMoreDisable: false,
      // similarity
      simVisible: false,
      simMode: 'ele',
      simElement: '',
      simVectorText: '',
      simCount: 10,
      simResults: [],
      simLoading: false,
    };
  },
  props: ['client', 'redisKey'],
  components: { VxeTable, VxeColumn },
  computed: {
    dialogTitle() {
      return this.beforeEditItem.element
        ? this.$t('message.edit_line')
        : this.$t('message.add_new_line');
    },
    vrangeSupport() {
      // available since redis >= 8.4
      return versionCompare(this.client.ardmInfo.redis_version, '8.4') >= 0;
    },
    isEdit() {
      return !!this.beforeEditItem.element;
    },
  },
  watch: {
    vectorData(newValue, oldValue) {
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
        this.listPage();
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    resetTable() {
      this.vectorData = [];
      this.vrangeStart = '-';
      this.loadMoreDisable = false;
    },
    loadMore() {
      this.loadingIcon = 'el-icon-loading';
      this.listPage();
    },
    initInfo() {
      return this.client.call('VINFO', this.redisKey).then((reply) => {
        const info = {};
        if (reply && reply.length) {
          for (let i = 0; i < reply.length; i += 2) {
            info[reply[i]] = reply[i + 1];
          }
        }
        this.infoDict = info;
        this.total = Number(info.size) || 0;
        this.dim = Number(info['vector-dim']) || 0;
      });
    },
    showInfo() {
      this.initInfo().then(() => {
        this.infoVisible = true;
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    listPage() {
      this.vrangeSupport ? this.listByVRange() : this.listByRandMember();
    },
    listByVRange() {
      const filter = (this.filterValue || '').trim();
      const { client, redisKey } = this;

      // if filter: first page with prefix: [prefix ... [prefix + 0xff
      // load more: (last ... [prefix + 0xff  (or + when no filter)
      let start = this.vrangeStart;
      let end = '+';

      if (filter) {
        // first page with filter
        (start === '-') && (start = `[${filter}`);
        end = Buffer.concat([Buffer.from(`[${filter}`), Buffer.from([0xff])]);
      }

      client.call('VRANGE', redisKey, start, end, this.pageSize).then((reply) => {
        const listData = this.resolveList(reply);
        this.vectorData = this.vectorData.concat(listData);

        // scan end
        if (listData.length < this.pageSize) {
          this.loadingIcon = '';
          this.loadMoreDisable = true;
          return;
        }

        // init "(lastitem" as start of next scanning
        this.vrangeStart = `(${reply[reply.length - 1]}`;
        this.loadingIcon = '';
      }).catch((e) => {
        this.loadingIcon = '';
        this.loadMoreDisable = true;
        this.$message.error(e.message);
      });
    },
    listByRandMember() {
      // Redis < 8.4 has no VRANGE; only sample one page and replace the list.
      this.loadMoreDisable = true;

      if (this.filterValue) {
        this.filterValue = '';
        this.$message.warning("Init list by VRANDMEMBER when Redis < 8.4, search not supported!");
      }

      this.client.call('VRANDMEMBER', this.redisKey, this.pageSize).then((reply) => {
        this.vectorData = this.resolveList(reply);
        this.loadingIcon = '';
      }).catch((e) => {
        this.loadingIcon = '';
        this.$message.error(e.message);
      });
    },
    resolveList(reply) {
      if (!reply || !reply.length) {
        return [];
      }

      return reply.map(element => ({ element }));
    },
    loadElementDetail(element) {
      return Promise.all([
        this.client.call('VEMB', this.redisKey, element).catch(() => null),
        this.client.call('VGETATTR', this.redisKey, element).catch(() => null),
      ]).then(([embed, attrs]) => {
        const vector = embed ? embed : [];
        return {
          vector,
          vectorText: vector.join(', '),
          attrs: attrs || '',
        };
      });
    },
    parseVectorText(text) {
      if (!text.trim()) {
        return null;
      }
      const vector = text.split(',').map(v => Number(v.trim()));
      if (!vector.length || vector.some(n => !Number.isFinite(n))) {
        return null;
      }
      return vector;
    },
    showEditDialog(row) {
      this.beforeEditItem = row;
      this.editLineItem = {
        element: row.element || '',
        vectorText: '',
        attrs: '',
      };

      this.editDialog = true;

      // load vector & attrs when edit
      if (this.isEdit) {
        this.loadElementDetail(row.element).then((detail) => {
          this.$set(this.editLineItem, 'vectorText', detail.vectorText);
          this.$set(this.editLineItem, 'attrs', detail.attrs);
        }).catch((e) => {
          this.$message.error(e.message);
        });
      }
    },
    editLine() {
      const before = this.beforeEditItem;
      const element = (this.editLineItem.element || '').trim();
      const vector = this.parseVectorText(this.editLineItem.vectorText);
      const attrs = (this.editLineItem.attrs || '').trim();

      if (!element) {
        return this.$message.error('Element is required');
      }
      if (!vector || !vector.length) {
        return this.$message.error('Vector is required');
      }
      if (this.dim && vector.length !== this.dim) {
        return this.$message.error(`Vector dimension must be ${this.dim}`);
      }
      if (attrs && !this.$util.isJson(attrs)) {
        return this.$message.error('Attributes must be valid JSON');
      }

      this.editDialog = false;

      const vaddArgs = [this.redisKey, 'VALUES', vector.length, ...vector, element];
      // must match existing set quant-type, otherwise: ERR asked quantization mismatch
      const quantOpt = this.getQuantOption();
      quantOpt && vaddArgs.push(quantOpt);

      // set attributes
      attrs && vaddArgs.push('SETATTR', attrs);

      this.client.call('VADD', ...vaddArgs).then(() => {
        if (this.isEdit) {
          this.$message.success({ message: this.$t('message.modify_success'), duration: 1000 });
        } else {
          this.vectorData.push({ element });
          this.total++;
          this.$message.success({ message: this.$t('message.add_success'), duration: 1000 });
        }
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    getQuantOption() {
      const quantType = (this.infoDict['quant-type'] || '').toLowerCase();
      if (!quantType) {
        return '';
      }
      if (quantType === 'int8' || quantType === 'q8') {
        return 'Q8';
      }
      if (quantType === 'bin' || quantType === 'binary') {
        return 'BIN';
      }
      // fp32
      return 'NOQUANT';
    },
    deleteLine(row) {
      this.$confirm(
        this.$t('message.confirm_to_delete_row_data'),
        { type: 'warning' },
      ).then(() => {
        this.client.call('VREM', this.redisKey, row.element).then((reply) => {
          if (reply > 0) {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.vectorData.splice(this.vectorData.indexOf(row), 1);
            this.total --;
          }
          else {
            this.$message.error({
              message: this.$t('message.delete_failed'),
              duration: 1000,
            });
          }
        }).catch((e) => { this.$message.error(e.message); });
      }).catch(() => {});
    },
    buildDumpCommand(line, detail) {
      const vector = detail.vector || [];
      const args = [
        'VADD',
        this.$util.bufToQuotation(this.redisKey),
        'VALUES',
        this.dim,
        ...vector,
        this.$util.bufToQuotation(line.element),
      ];

      const quantOpt = this.getQuantOption();
      quantOpt && args.push(quantOpt);

      if (detail.attrs) {
        args.push('SETATTR', this.$util.bufToQuotation(detail.attrs));
      }
      return args.join(' ');
    },
    dumpCommand(item) {
      const lines = item ? [item] : this.vectorData;
      if (!lines.length) {
        return;
      }

      Promise.all(lines.map(line => this.loadElementDetail(line.element).then(detail => ({ line, detail }))))
        .then((pairs) => {
          const commands = pairs.map(({ line, detail }) => this.buildDumpCommand(line, detail));
          this.$util.copyToClipboard(commands.join('\n'));
          this.$message.success({ message: this.$t('message.copy_success'), duration: 800 });
        })
        .catch((e) => {
          this.$message.error(e.message);
        });
    },
    openSimDialog(row) {
      this.simVisible = true;
      this.simResults = [];
      if (row && row.element) {
        this.simMode = 'ele';
        this.simElement = row.element;
      }
    },
    runSimilarity() {
      const { client, redisKey } = this;
      const count = this.simCount;
      let args;

      // search by element name
      if (this.simMode === 'ele') {
        const element = (this.simElement || '').trim();
        if (!element) {
          return this.$message.error('Element is required');
        }
        args = ['VSIM', redisKey, 'ELE', element, 'WITHSCORES', 'WITHATTRIBS', 'COUNT', count];
      }
      // search by vector
      else {
        const vector = this.parseVectorText(this.simVectorText);
        if (!vector) {
          return this.$message.error('Something wrong with your vector');
        }
        if (this.dim && vector.length !== this.dim) {
          return this.$message.error(`Vector dimension must be ${this.dim}`);
        }
        args = ['VSIM', redisKey, 'VALUES', vector.length, ...vector, 'WITHSCORES', 'WITHATTRIBS', 'COUNT', count];
      }

      this.simLoading = true;

      client.call(...args).then((reply) => {
        this.simResults = this.parseSimReply(reply);
        this.simLoading = false;
      }).catch((e) => {
        this.simLoading = false;
        this.$message.error(e.message);
      });
    },
    parseSimReply(reply) {
      if (!reply) {
        return [];
      }

      // [ele, score, attrs, ...]
      const rows = [];
      for (let i = 0; i < reply.length; i += 3) {
        rows.push({
          element: reply[i],
          score: reply[i + 1],
          attrs: reply[i + 2] || '',
        });
      }
      return rows;
    },
  },
  mounted() {
    this.initShow();
  },
};
</script>

<style type="text/css">
  .key-content-vector .vector-dim-hint {
    color: #909399;
    font-size: 12px;
  }
</style>
