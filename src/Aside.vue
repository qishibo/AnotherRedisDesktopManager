<template>
  <div class="aside-outer-container">
    <div>
      <!-- new connection button -->
      <div class="aside-top-container">
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-time" @click="$refs.commandLogDialog.show()" :title='$t("message.command_log")' plain></el-button>
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-setting" @click="$refs.settingDialog.show()" :title='$t("message.settings")' plain></el-button>

        <div class="aside-new-connection-container">
          <el-button class="aside-new-connection-btn" type="info" @click="addNewConnection" icon="el-icon-circle-plus">{{ $t('message.new_connection') }}</el-button>
        </div>
      </div>

      <!-- new connection dialog -->
      <NewConnectionDialog
        @editConnectionFinished="editConnectionFinished"
        ref="newConnectionDialog">
      </NewConnectionDialog>

      <Setting ref="settingDialog"></Setting>

      <!-- redis command logs -->
      <CommandLog ref='commandLogDialog'></CommandLog>
    </div>

    <!-- connection list -->
    <Connections ref="connections" class="connections-list"></Connections>
  </div>
</template>

<script type="text/javascript">
import Setting from '@/components/Setting';
import Connections from '@/components/Connections';
import NewConnectionDialog from '@/components/NewConnectionDialog';
import CommandLog from '@/components/CommandLog';

export default {
  data() {
    return {};
  },
  components: { Connections, NewConnectionDialog, Setting, CommandLog },
  methods: {
    editConnectionFinished() {
      this.$refs.connections.initConnections();
    },
    addNewConnection() {
      this.$refs.newConnectionDialog.show();
    },
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

  .aside-outer-container .connections-list {
    overflow-y: auto;
    height: calc(100vh - 54px);
    margin-top: 4px;
    /*border-top: 1px solid #dbdada;*/
  }
</style>
