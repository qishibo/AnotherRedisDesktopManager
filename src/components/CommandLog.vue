<template>
<el-dialog @open='openDialog' :title="$t('message.command_log')" :visible.sync="visible" custom-class='command-log-dialog' width="90%" append-to-body>
  <!-- key list -->
  <div class="command-log-list">
    <vxe-table
      ref="commandLogList"
      size="mini" max-height="100%"
      border="none" show-overflow="title"
      :scroll-y="{enabled: true}"
      :row-config="{isHover: true, height: 24}"
      :column-config="{resizable: true}"
      :empty-text="$t('el.table.emptyText')"
      :data="logsShow">
      <vxe-column field="time" title="Time" width="90"></vxe-column>
      <vxe-column field="name" title="Connection" width="168"></vxe-column>
      <vxe-column field="cmd" title="CMD" width="130" class-name="command-cmd"></vxe-column>
      <vxe-column field="args" title="Args" min-width="90"></vxe-column>
      <vxe-column field="cost" title="Cost(ms)" width="90" class-name="command-cost"></vxe-column>
    </vxe-table>
  </div>

  <!-- filter -->
  <el-input v-model='filter' size='mini' style='max-width: 200px;' :placeholder="$t('message.key_to_search')"></el-input>&nbsp;
  <!-- show only write commands -->
  <el-checkbox v-model='showOnlyWrite'>Only Write</el-checkbox>

  <div slot="footer" class="dialog-footer">
    <el-button @click="logs=[]">{{ $t('el.colorpicker.clear') }}</el-button>
    <el-button @click="visible=false">{{ $t('el.messagebox.cancel') }}</el-button>
  </div>
</el-dialog>
</template>

<script type="text/javascript">
import { writeCMD } from '@/commands.js';
import { VxeTable, VxeColumn } from 'vxe-table';

export default {
  data() {
    return {
      visible: false,
      logs: [],
      maxLength: 5000,
      filter: '',
      showOnlyWrite: false,
    };
  },
  components: { VxeTable, VxeColumn, },
  created() {
    this.$bus.$on('commandLog', (record) => {
      // hide ping
      if (record.command.name === 'ping') {
        return;
      }

      this.logs.push({
        cmd: record.command.name,
        args: (record.command.name === 'auth') ? '***' : record.command.args.map(item => (item.length > 100 ? (`${item.slice(0, 100)}...`) : item.toString())).join(' '),
        cost: record.cost.toFixed(2),
        time: record.time.toTimeString().substr(0, 8),
        name: record.connectionName,
      });

      this.logs.length > this.maxLength && (this.logs = this.logs.slice(-this.maxLength));
      this.visible && this.scrollToBottom();
    });
  },
  computed: {
    logsShow() {
      let { logs } = this;

      if (this.showOnlyWrite) {
        logs = logs.filter(item => writeCMD[item.cmd.toUpperCase()]);
      }

      if (this.filter) {
        logs = logs.filter(item => item.cmd.includes(this.filter) || item.args.includes(this.filter));
      }

      return logs;
    },
  },
  methods: {
    show() {
      this.visible = true;
    },
    openDialog() {
      this.scrollToBottom();
    },
    scrollToBottom() {
      setTimeout(() => {
        this.$refs.commandLogList &&
          this.$refs.commandLogList.scrollTo(0, 99999999);
      }, 0);
    },
  },
};
</script>

<style type="text/css">
  .command-log-dialog.el-dialog {
    margin-top: 10vh !important;
  }
  .command-log-list {
    padding: 6px;
    min-height: 150px;
    height: calc(90vh - 307px);
    border: 1px solid grey;
    border-radius: 5px;
    margin-bottom: 12px;
  }

  .command-log-list .command-cmd {
    font-weight: bold;
    font-size: 110%;
  }
  .command-log-list .command-cost {
    color: #e59090;
  }
</style>
