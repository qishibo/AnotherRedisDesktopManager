<template>
  <div>
    <div>
      <!-- new connection button -->
      <div class="aside-top-container">
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-setting" @click="$refs.settingDialog.show()" plain></el-button>

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
    </div>

    <!-- connection list -->
    <div class="connections-list">
      <Connections ref="connections"></Connections>
    </div>
  </div>
</template>

<script type="text/javascript">
import Setting from '@/components/Setting';
import Connections from '@/components/Connections';
import NewConnectionDialog from '@/components/NewConnectionDialog';

export default {
  data() {
    return {};
  },
  components: { Connections, NewConnectionDialog, Setting },
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
    margin-right: 56px;
  }
  .aside-new-connection-container .aside-new-connection-btn {
    width: 100%;
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
