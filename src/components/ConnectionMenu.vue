<template>
<div>
  <div class="connection-opt-icons">
    <!-- right menu operate icons -->
    <i :title="$t('message.redis_status')" class="connection-right-icon fa fa-home" @click.stop.prevent="openStatus()"></i>
    <i :title="$t('message.redis_console')" class="connection-right-icon fa fa-terminal" @click.stop.prevent="openCli()"></i>
    <i :title="$t('message.edit_connection')" class="connection-right-icon el-icon-edit-outline" @click.stop.prevent="showEditConnection()"></i>
    <i :title="$t('message.del_connection')" class="connection-right-icon el-icon-delete" @click.stop.prevent="deleteConnection()"></i>

    <!-- more operate menu -->
    <el-dropdown
      placement='bottom-start'
      @command='handleMoreOperate'
      :show-timeout=100
      :hide-timeout=300>
      <i class="connection-right-icon el-icon-menu"></i>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command='refresh'>
          <i class='el-icon-refresh'> {{ $t('message.refresh_connection') }}</i>
        </el-dropdown-item>
        <!-- <el-dropdown-item command='batchDel'>
          <i class='el-icon-delete'> Batch Delete</i>
        </el-dropdown-item> -->
        <el-dropdown-item command='flushDB'>
          <i class='fa fa-bomb'> {{ $t('message.flushdb') }}</i>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
  <div :title="config.connectionName" class="connection-name">{{config.connectionName}}</div>

  <!-- edit connection dialog -->
  <NewConnectionDialog
    editMode='true'
    :config='config'
    @editConnectionFinished='editConnectionFinished'
    ref='editConnectionDialog'>
  </NewConnectionDialog>
</div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import NewConnectionDialog from '@/components/NewConnectionDialog';

export default {
  data() {
    return {};
  },
  props: ['config', 'client'],
  components: {NewConnectionDialog},
  methods: {
    refreshConnection() {
      this.$emit('refreshConnection');
    },
    showEditConnection() {
      this.$confirm(
        this.$t('message.close_to_edit_connection'),
        { type: 'warning' },
      ).then(() => {
        this.$bus.$emit('closeAllConnection');
        this.$refs.editConnectionDialog.dialogVisible = true;
      }).catch(() => {});
    },
    editConnectionFinished() {
      this.$bus.$emit('refreshConnections');
    },
    deleteConnection() {
      this.$confirm(
        this.$t('message.confirm_to_delete_connection'),
        { type: 'warning' },
      ).then(() => {
        storage.deleteConnection(this.config);
        this.$bus.$emit('refreshConnections');

        this.$message.success({
          message: this.$t('message.delete_success'),
          duration: 1000,
        });
      }).catch(() => {});
    },
    openStatus() {
      if (!this.client) {
        // open Connections.vue menu
        this.$parent.$parent.$parent.$refs.connectionMenu.open(this.config.connectionName);
        // open connection
        this.$parent.$parent.$parent.openConnection(this.config.connectionName);
      }

      else {
        this.$bus.$emit('openStatus', this.client, this.config.connectionName);
      }
    },
    openCli() {
      // open cli before connection opened
      if (!this.client) {
        // open Connections.vue menu
        this.$parent.$parent.$parent.$refs.connectionMenu.open(this.config.connectionName);
        // open connection
        this.$parent.$parent.$parent.openConnection(this.config.connectionName, () => {
          this.$bus.$emit('openCli', this.client, this.config.connectionName);
        });
      }

      else {
        this.$bus.$emit('openCli', this.client, this.config.connectionName);
      }
    },
    handleMoreOperate(operate) {
      console.log(operate);
      switch (operate) {
        case 'refresh':
          this.refreshConnection();
          break;
        case 'flushDB':
          this.flushDB();
          break;
        case 'batchDel':
          break;
      }
    },
    flushDB() {
      if (!this.client) {
        return;
      }

      this.$confirm(
        this.$t('message.confirm_flush_db', {db: this.client.condition.select}),
        {type: 'warning'}
      ).then(() => {
        this.client.flushdb().then((reply) => {
          if (reply == 'OK') {
            this.$message.success({
              message: this.$t('message.delete_success'),
              duration: 1000,
            });

            this.refreshConnection();
          }
        });
      }).catch(() => {});
    },
  },
}
</script>

<style type="text/css">
  /*el-sub-menu connection name style*/
  .connection-menu .el-submenu__title {
    padding-left: 0px !important;
    padding-right: 0px;
    font-size: 13px !important;
  }

  .connection-menu .connection-name {
    margin-right: 115px;
    padding-right: 6px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    font-size: 104%;
  }
  .connection-menu .connection-opt-icons {
    /*width: 30px;*/
    /*float: right;
    margin-right: 28px;*/
    position: absolute;
    right: 25px;
  }
  .connection-menu .connection-right-icon {
    display: inline-block;
    font-size: 14px;
    /*font-weight: bold;*/
    padding: 3px;
    margin-right: -4px;
    transition: background 0.2s;
  }
  .connection-menu .connection-right-icon:hover {
    /*color: #85878a;*/
    background: #dcdee0;
    border-radius: 3px;
  }
  .dark-mode .connection-menu .connection-right-icon:hover {
    background: #58707b;
  }
</style>
