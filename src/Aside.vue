<template>
  <div>
    <div>
      <!-- new connection button -->
      <div class="aside-new-connection-container">
        <el-button class="aside-new-connection" type="info" @click="addNewConnection" icon="el-icon-circle-plus">{{ $t('message.new_connection') }}</el-button>
      </div>

      <!-- new connection dialog -->
      <NewConnectionDialog
        @editConnectionFinished="editConnectionFinished"
        ref="newConnectionDialog">
      </NewConnectionDialog>
    </div>

    <!-- connection list -->
    <div class="connections-list">
      <Connections ref="connections"></Connections>
    </div>
  </div>
</template>

<script>
import storage from '@/storage';
import Connections from '@/components/Connections';
import NewConnectionDialog from '@/components/NewConnectionDialog';

export default {
  data() {
    return {};
  },
  components: { Connections, NewConnectionDialog },
  methods: {
    editConnectionFinished() {
      this.$refs.connections.initConnections();
    },
    addNewConnection() {
      this.$refs.newConnectionDialog.dialogVisible = true;
    },
  },
};
</script>

<style type="text/css">
  .aside-new-connection-container {
    margin-right: 8px;
  }
  .aside-new-connection {
    width: 100%;
  }
</style>
