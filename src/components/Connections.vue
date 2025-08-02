<template>
  <div class="connections-wrap">
    <!-- search and group management -->
    <div class="search-and-group">
      <div v-if="connections.length>=filterEnableNum" class="filter-input">
        <el-input
          v-model="filterMode"
          suffix-icon="el-icon-search"
          :placeholder="$t('message.search_connection')"
          clearable
          size="mini">
        </el-input>
      </div>
      <el-button size="mini" @click="showGroupDialog = true" class="add-group-btn">
        <i class="el-icon-folder-add"></i>
        新建分组
      </el-button>
    </div>

    <!-- connections list -->
    <div class="connections-list">
      <!-- ungrouped connections -->
      <div class="connection-wrapper"
        v-for="item, index of ungroupedConnections"
        :key="item.key ? item.key : item.connectionName"
        :index="item.connectionName">
        <ConnectionWrapper
          :index="index"
          :globalSettings="globalSettings"
          :config='item'>
        </ConnectionWrapper>
      </div>

      <!-- grouped connections -->
      <div class="group-list" v-if="hasGroups">
        <el-collapse v-model="activeGroups">
          <el-collapse-item 
            v-for="group in groups" 
            :key="group.id" 
            :name="group.id"
            :data-group-id="group.id">
          <template slot="title">
            <div class="group-title">
              <i class="fa fa-folder-o" v-if="!activeGroups.includes(group.id)"></i>
              <i class="fa fa-folder-open-o" v-else></i>
              <span class="group-name">{{ group.name }}</span>
              <div class="group-actions">
                <el-button size="mini" type="text" @click.stop="handleGroupCommand('edit', group)">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button size="mini" type="text" @click.stop="handleGroupCommand('delete', group)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </template>
          <div class="group-connections">
            <div class="connection-wrapper"
              v-for="(item, index) in getGroupConnections(group.id)"
              :key="item.key ? item.key : item.connectionName"
              :index="item.connectionName">
              <ConnectionWrapper
                :index="index"
                :globalSettings="globalSettings"
                :config='item'>
              </ConnectionWrapper>
            </div>
          </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- group dialog -->
    <el-dialog :title="groupDialogTitle" :visible.sync="showGroupDialog" width="30%">
      <el-form :model="groupForm" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="groupForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showGroupDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGroupSubmit">确定</el-button>
      </span>
    </el-dialog>

    <ScrollToTop parentNum='1' :posRight='false'></ScrollToTop>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import ConnectionWrapper from '@/components/ConnectionWrapper';
import ScrollToTop from '@/components/ScrollToTop';
import Sortable from 'sortablejs';


export default {
  data() {
    return {
      connections: [],
      globalSettings: this.$storage.getSetting(),
      filterEnableNum: 4,
      filterMode: '',
      groups: [],
      showGroupDialog: false,
      groupForm: {
        id: '',
        name: ''
      },
      editingGroupId: null,
      activeGroups: []
    };
  },
  components: { ConnectionWrapper, ScrollToTop },
  created() {
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
    this.$bus.$on('reloadSettings', (settings) => {
      this.globalSettings = settings;
    });
  },
  computed: {
    filteredConnections() {
      if (!this.filterMode) {
        return this.connections;
      }
      return this.connections.filter(item => {
        return item.connectionName.toLowerCase().includes(this.filterMode.toLowerCase());
      });
    },
    ungroupedConnections() {
      return this.filteredConnections.filter(conn => !conn.groupId);
    },
    hasGroups() {
      return this.groups.length > 0;
    },
    groupDialogTitle() {
      return this.editingGroupId ? '编辑分组' : '新建分组';
    }
  },
  methods: {
    getGroupConnections(groupId) {
      return this.filteredConnections.filter(conn => conn.groupId === groupId);
    },
    handleGroupCommand(command, group) {
      if (command === 'edit') {
        this.editingGroupId = group.id;
        this.groupForm = { ...group };
        this.showGroupDialog = true;
      } else if (command === 'delete') {
        this.$confirm('确认删除该分组？连接将被移至未分组区域', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.connections.forEach(conn => {
            if (conn.groupId === group.id) {
              conn.groupId = null;
            }
          });
          this.groups = this.groups.filter(g => g.id !== group.id);
          this.$storage.setGroups(this.groups);
          this.$storage.reOrderAndStore(this.connections);
          this.$bus.$emit('groups-updated');
        });
      }
    },
    handleGroupSubmit() {
      if (!this.groupForm.name.trim()) {
        this.$message.error('分组名称不能为空');
        return;
      }
      if (this.editingGroupId) {
        const index = this.groups.findIndex(g => g.id === this.editingGroupId);
        if (index !== -1) {
          this.groups[index].name = this.groupForm.name;
        }
      } else {
        this.groups.push({
          id: Date.now().toString(),
          name: this.groupForm.name
        });
      }
      this.$storage.setGroups(this.groups);
      this.showGroupDialog = false;
      this.groupForm = { id: '', name: '' };
      this.editingGroupId = null;
      this.$bus.$emit('groups-updated');
    },
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = [];

      for (const item of connections) {
        item.connectionName = storage.getConnectionName(item);
        // fix history bug, prevent db into config
        delete item.db;
        // 保持已有的分组信息
        if (!item.hasOwnProperty('groupId')) {
          item.groupId = null;
        }
        slovedConnections.push(item);
      }

      this.connections = slovedConnections;
    },
    sortOrder() {
      // 为未分组区域创建拖拽
      const ungroupedArea = document.querySelector('.connections-list');
      Sortable.create(ungroupedArea, {
        handle: '.el-submenu__title',
        animation: 150,
        direction: 'vertical',
        group: 'connections',
        draggable: '.connection-wrapper',
        filter: '.el-collapse',
        onEnd: (e) => {
          const { newIndex, to, item } = e;
          const { oldIndex, from } = e;
          
          // 如果是在同一区域内拖动
          if (from === to) {
            const currentRow = this.connections.splice(oldIndex, 1)[0];
            this.connections.splice(newIndex, 0, currentRow);
            this.$storage.reOrderAndStore(this.connections);
            return;
          }

          // 获取连接的key
          const connectionKey = item.getAttribute('index');
          const connection = this.connections.find(c => c.connectionName === connectionKey);
          
          // 如果拖入分组
          if (to.closest('.el-collapse-item')) {
            const groupId = to.closest('.el-collapse-item').getAttribute('data-group-id');
            if (connection) {
              connection.groupId = groupId;
              this.$storage.reOrderAndStore(this.connections);
            }
          } 
          // 如果拖出分组
          else {
            if (connection) {
              connection.groupId = null;
              this.$storage.reOrderAndStore(this.connections);
            }
          }
        },
      });

      // 为每个分组创建拖拽
      this.$nextTick(() => {
        const groups = document.querySelectorAll('.group-connections');
        groups.forEach(group => {
          Sortable.create(group, {
            handle: '.el-submenu__title',
            animation: 150,
            direction: 'vertical',
            group: 'connections',
            draggable: '.connection-wrapper'
          });
        });
      });

      // 为分组创建拖拽
      const groupList = document.querySelector('.group-list');
      if (groupList) {
        Sortable.create(groupList, {
          handle: '.el-collapse-item__header',
          animation: 150,
          direction: 'vertical',
          draggable: '.el-collapse',
          onEnd: (e) => {
            const { newIndex, oldIndex } = e;
            const group = this.groups.splice(oldIndex, 1)[0];
            this.groups.splice(newIndex, 0, group);
            this.$storage.setGroups(this.groups);
          }
        });
      }
    },
  },
  mounted() {
    this.initConnections();
    this.groups = this.$storage.getGroups();
    this.sortOrder();
    this.activeGroups = [];
  },
};
</script>

<style type="text/css">
  .connections-wrap {
    height: calc(100vh - 59px);
    overflow-y: auto;
    margin-top: 11px;
  }
  .search-and-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
    padding-right: 13px;
  }
  .filter-input {
    flex: 1;
  }
  .add-group-btn {
    white-space: nowrap;
  }
  /* set drag area min height, target to the end will be correct */
  .connections-wrap .connections-list {
    min-height: calc(100vh - 110px);
  }
  .el-collapse-item__header {
    font-size: 14px;
    padding: 0 8px;
    height: 40px;
    line-height: 40px;
    background-color: #f5f7fa;
    transition: all 0.3s;
  }
  .el-collapse-item__header:hover {
    background-color: #e6e9ed;
  }
  .el-collapse-item.is-active .el-collapse-item__header {
    background-color: #edf2fc;
  }
  .el-collapse-item__content {
    padding: 0;
  }
  .group-connections {
    min-height: 10px;
    /* padding-left: 8px; */
  }
  .group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .group-name {
    font-weight: bold;
    color: #606266;
    margin-left: 8px;
  }
  .el-icon-folder,
  .el-icon-folder-opened {
    font-size: 16px;
    color: #909399;
  }
  .group-actions {
    margin-right: 10px;
  }
  .group-actions .el-button {
    padding: 0 5px;
  }
  .group-actions .el-button + .el-button {
    margin-left: 5px;
  }
  .sortable-ghost {
    opacity: 0.8;
    background: #f5f7fa !important;
    border: 2px dashed #409eff;
  }
  .connection-wrapper {
    cursor: move;
  }
  .group-list {
    cursor: move;
    /*padding: 5px;*/
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }
  .el-collapse {
    border: none;
    margin-bottom: 10px;
  }
  .el-collapse-item__header .group-actions {
    cursor: default;
  }
</style>
