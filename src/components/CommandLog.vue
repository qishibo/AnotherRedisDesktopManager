<template>
<el-dialog @open='openDialog' :title="$t('message.command_log')" :visible.sync="visible" custom-class='command-log-dialog' width="90%" append-to-body>
  <ul ref='commandLogUl' class="command-log-ul">
    <li v-for="record of logs">
      <span class="command-time">{{ record.time }} -</span>
      <span class="command-con-name">[{{ record.connectionName }}]:&nbsp;</span>
      <span class="command-name">{{ record.name }} </span>
      <span class="command-args">{{ record.args }}&nbsp;</span>
      <span class="command-cost">[{{ record.cost }}ms]</span>
    </li>
  </ul>

  <div slot="footer" class="dialog-footer">
    <el-button @click="logs=[]">{{ $t('el.colorpicker.clear') }}</el-button>
    <el-button @click="visible=false">{{ $t('el.messagebox.cancel') }}</el-button>
  </div>
</el-dialog>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      visible: false,
      logs: [],
    };
  },
  created() {
    this.$bus.$on('commandLog', record => {
      // hide ping
      if (record.command.name === 'ping') {
        return;
      }

      this.logs.push({
        name: record.command.name,
        args: (record.command.name === 'auth') ? '***' : record.command.args.map(item => {
          return item.length > 100 ? (item.slice(0, 100) + '...') : item.toString();
        }).join(' '),
        cost: record.cost.toFixed(2),
        time: record.time.toTimeString().substr(0, 8),
        connectionName: record.connectionName,
      });

      this.visible && this.scrollToBottom();
    });
  },
  methods: {
    show() {
      this.visible = true;
    },
    openDialog() {
      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const dom = this.$refs.commandLogUl;
        dom && (dom.scrollTop = dom.scrollHeight);
      });
    },
  },
};
</script>

<style type="text/css">
  .command-log-dialog.el-dialog {
    margin-top: 10vh !important;
  }
  .command-log-ul {
    padding: 10px; 
    overflow: auto;
    min-height: 150px;
    height: calc(90vh - 307px);
    border: 1px solid grey;
    border-radius: 5px;
    list-style-type: none;
  }
  .command-log-ul li {
    color: #333;
  }
  .dark-mode .command-log-ul li {
    color: #f7f7f7;
  }

  .command-log-ul .command-time {
    /*color: #f7f7f7;*/
  }
  .command-log-ul .command-con-name {
    color: #7a7a7a;
  }
  .dark-mode .command-log-ul .command-con-name {
    color: #b4b3b3;
  }
  .command-log-ul .command-name {
    font-weight: bold;
  }
  .command-log-ul .command-args {
    color: #7a7a7a;
    font-size: 95%;
  }
  .dark-mode .command-log-ul .command-args {
    color: #b4b3b3;
  }
  .command-log-ul .command-cost {
    color: #e59090;
    font-size: 90%;
  }
</style>
