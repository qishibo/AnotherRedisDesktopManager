<template>
  <div class="aside-outer-container">
    <div>
      <!-- new connection button -->
      <div class="aside-top-container">
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-time" @click="$refs.commandLogDialog.show()" :title='$t("message.command_log")+" Ctrl+g"' plain></el-button>
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-setting" @click="$refs.settingDialog.show()" :title='$t("message.settings")+" Ctrl+,"' plain></el-button>

        <div class="aside-new-connection-container">
          <el-button class="aside-new-connection-btn" type="info" @click="addNewConnection" icon="el-icon-circle-plus" :title='$t("message.new_connection")+" Ctrl+n"'>{{ $t('message.new_connection') }}</el-button>
        </div>
      </div>

      <!-- new connection dialog -->
      <NewConnectionDialog
        @editConnectionFinished="editConnectionFinished"
        ref="newConnectionDialog">
      </NewConnectionDialog>

      <!-- user settings -->
      <Setting ref="settingDialog"></Setting>

      <!-- redis command logs -->
      <CommandLog ref='commandLogDialog'></CommandLog>
      <!-- hot key tips dialog -->
      <HotKeys ref='hotKeysDialog'></HotKeys>
      <!-- custom shell formatter -->
      <CustomFormatter></CustomFormatter>
    </div>

    <!-- connection list -->
    <Connections ref="connections"></Connections>
  </div>
</template>

<script type="text/javascript">
import Setting from '@/components/Setting';
import Connections from '@/components/Connections';
import NewConnectionDialog from '@/components/NewConnectionDialog';
import CommandLog from '@/components/CommandLog';
import HotKeys from '@/components/HotKeys';
import CustomFormatter from '@/components/CustomFormatter';

export default {
  data() {
    return {};
  },
  components: { Connections, NewConnectionDialog, Setting, CommandLog, HotKeys, CustomFormatter },
  methods: {
    editConnectionFinished() {
      this.$refs.connections.initConnections();
    },
    addNewConnection() {
      this.$refs.newConnectionDialog.show();
    },
    initShortcut() {
      // new connection
      this.$shortcut.bind('ctrl+n, ⌘+n', () => {
        this.$refs.newConnectionDialog.show();
        return false;
      });
      // settings
      this.$shortcut.bind('ctrl+,', () => {
        this.$refs.settingDialog.show();
        return false;
      });
      this.$shortcut.bind('⌘+,', () => {
        this.$refs.settingDialog.show();
        return false;
      });
      // logs
      this.$shortcut.bind('ctrl+g, ⌘+g', () => {
        this.$refs.commandLogDialog.show();
        return false;
      });
    },
  },
  mounted() {
    this.initShortcut();
  },
};
</script>

<style type="text/css">
  .aside-top-container {
    margin-right: 8px;
  }
  .aside-top-container .aside-new-connection-container {
    margin-right: 109px;
  }
  .aside-new-connection-container .aside-new-connection-btn {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .aside-top-container .aside-setting-btn {
    float: right;
    width: 44px;
    margin-right: 5px;
  }

  .dark-mode .aside-top-container .el-button--info {
    color: #52a6fd;
    background: inherit;
  }
</style>
