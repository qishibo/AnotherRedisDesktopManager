<template>
<div>
  <div class="connection-opt-icons">
    <i :title="$t('message.refresh_connection')" class="connection-right-icon el-icon-refresh" @click.stop.prevent="refreshConnection()"></i>
    <i :title="$t('message.redis_console')" class="connection-right-icon fa fa-terminal" @click.stop.prevent="openCli()"></i>
    <i :title="$t('message.edit_connection')" class="connection-right-icon el-icon-edit-outline" @click.stop.prevent="showEditConnection()"></i>
    <i :title="$t('message.del_connection')" class="connection-right-icon el-icon-delete" @click.stop.prevent="deleteConnection()"></i>
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
  props: ['config'],
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
    openCli() {
      // todo: if ConnectionMenu.vue owns its self client,
      // use client emit to Tabs.vue directly is better.
      this.$bus.$emit('proxyOpenCli', this.config.connectionName);
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
    /*margin-right: 65px;*/
    padding-right: 6px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    font-size: 103%;
  }
  .connection-menu .connection-opt-icons {
    /*width: 30px;*/
    float: right;
    margin-right: 28px;
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
</style>
