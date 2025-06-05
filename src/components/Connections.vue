<template>
  <div class="connections-wrap">
    <!-- filter input and new group button -->
    <div class="connections-header">
      <el-input v-model="filterText" :placeholder="$t('message.filter_connections')" prefix-icon="el-icon-search" clearable class="filter-input">
      </el-input>
      <el-button type="text" icon="el-icon-plus" @click="createNewGroup" class="new-group-btn">
        {{ $t('message.new_group') }}
      </el-button>
    </div>

    <!-- connections list -->
    <div class="connections-list" ref="groupsList">
      <!-- grouped connections -->
      <div v-for="{ group, groupId } in groupedConnections" :key="groupId" class="connection-group">
        <div class="group-header" :data-group="groupId">
          <div class="group-header-left" @click="toggleGroupCollapse(groupId)">
            <i :class="['el-icon-arrow-down', 'collapse-icon', { 'is-collapsed': isGroupCollapsed(groupId) }]">
            </i>
            <span v-if="editingGroup != groupId">{{ getGroupNameById(groupId) || $t('message.default_group') }}</span>
            <el-input v-else v-model="editingGroupName" size="small" @blur="finishEditGroup" @keyup.enter.native="finishEditGroup" @keyup.esc.native="cancelEditGroup" ref="groupNameInput" class="group-name-input">
            </el-input>
          </div>
          <div class="group-header-right" draggable="true" @dragstart="onGroupDragStart" @dragend="onGroupDragEnd">
            <div class="group-actions" v-if="groupId && groupId != 1">
              <el-button type="text" icon="el-icon-edit" @click="startEditGroup(groupId)" class="group-action-btn">
              </el-button>
              <el-button type="text" icon="el-icon-delete" @click="deleteGroup(groupId)" class="group-action-btn">
              </el-button>
            </div>
          </div>
        </div>
        <div class="group-connections" :data-group="groupId" v-show="!isGroupCollapsed(groupId)">
          <div v-for="connection in group" :key="connection.key" class="connection-wrapper" :data-key="connection.key">
            <ConnectionWrapper :config="connection" :globalSettings="globalSettings" :index="connection.key">
            </ConnectionWrapper>
          </div>
        </div>
      </div>
    </div>

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
      groups: [],
      groupOrder: [],
      collapsedGroups: [],
      globalSettings: this.$storage.getSetting(),
      filterText: '',
      editingGroup: null,
      editingGroupName: '',
      sortableInstances: [],
      dragStartY: 0,
      dragStartX: 0
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
      if (!this.filterText) {
        return this.connections;
      }

      const filter = this.filterText.toLowerCase();
      return this.connections.filter(conn => {
        const groupName = this.getGroupNameById(conn.groupId);
        return (conn.connectionName && conn.connectionName.toLowerCase().includes(filter)) ||
          (conn.host && conn.host.toLowerCase().includes(filter)) ||
          (groupName && groupName.toLowerCase().includes(filter));
      });
    },
    groupedConnections() {
      const defaultGroupId = 1;
      const groups = [];
      const groupMap = {};
      // 按照保存的顺序添加其他分组
      this.groupOrder.forEach(groupId => {
        if (groupMap[groupId]) {
          return;
        }
        const group = { group: [], groupId: groupId };
        groupMap[groupId] = group;
        groups.push(group);
      });
      if (!groupMap[defaultGroupId]) {
        groups.unshift({ group: [], groupId: defaultGroupId });
      }

      // 添加连接到对应的分组
      this.filteredConnections.forEach(conn => {
        const groupId = conn.groupId || defaultGroupId;
        if (!groupMap[groupId]) {
          groupId = defaultGroupId;
        }
        groupMap[groupId].group.push(conn);
      });
      return groups;
    }
  },
  methods: {
    getGroupNameById(groupId) {
      const group = this.groups.find(g => g.id == groupId);
      return group ? group.name : this.$t('message.default_group');
    },
    getGroupById(groupId) {
      return this.groups.find(g => g.id == groupId);
    },
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = [];

      for (const item of connections) {
        item.connectionName = storage.getConnectionName(item);
        delete item.db;
        slovedConnections.push(item);
      }

      this.connections = slovedConnections;
      this.groups = storage.getGroups();

      // 只在初始化时设置分组顺序
      if (!this.groupOrder.length) {
        this.initGroupOrder();
      }

      // 初始化折叠状态
      this.initCollapsedGroups();

      this.initSortable();
    },
    initGroupOrder() {
      // 从 localStorage 获取保存的分组顺序
      const savedOrder = localStorage.getItem('groupOrder');
      if (savedOrder) {
        this.groupOrder = JSON.parse(savedOrder);
        // 确保所有分组都在顺序列表中
        this.groups.forEach(group => {
          if (!this.groupOrder.includes(group.id)) {
            this.groupOrder.push(group.id);
          }
        });
      } else {
        // 如果没有保存的顺序，使用默认顺序
        this.groupOrder = [1]; // 默认分组 id 为 1
        this.groups.forEach(group => {
          if (group.id != 1) {
            this.groupOrder.push(group.id);
          }
        });
      }
      // 保存更新后的顺序
      this.saveGroupOrder();
    },
    saveGroupOrder() {
      localStorage.setItem('groupOrder', JSON.stringify(this.groupOrder));
    },
    createNewGroup() {
      const baseName = this.$t('message.new_group');
      let newGroupName = baseName;
      let counter = 1;

      // 检查是否存在同名分组，如果存在则添加数字后缀
      while (this.groups.some(g => g.name == newGroupName)) {
        newGroupName = `${baseName} ${counter}`;
        counter++;
      }

      // 生成新的分组 id
      const maxId = Math.max(...this.groups.map(g => g.id || 0), 1);
      const newGroupId = maxId + 1;

      const newGroup = {
        id: newGroupId,
        name: newGroupName
      };

      // 添加到 groups 数组
      this.groups.push(newGroup);

      // 保存到存储
      storage.setGroups(this.groups);

      // 添加到分组顺序
      this.groupOrder.push(newGroupId);
      this.saveGroupOrder();

      // 刷新连接列表
      this.initConnections();
      this.$message.success(this.$t('message.save_group_success'));
    },
    startEditGroup(groupId) {
      if (groupId == 1) { // 默认分组不能编辑
        return;
      }
      const group = this.getGroupById(groupId);
      if (!group) return;

      this.editingGroup = groupId;
      this.editingGroupName = group.name;

      // 禁用分组拖动
      this.setGroupSortableEnabled(false);

      this.$nextTick(() => {
        if (this.$refs.groupNameInput) {
          this.$refs.groupNameInput[0].focus();
        }
      });
    },
    finishEditGroup() {
      if (!this.editingGroup || !this.editingGroupName.trim()) {
        this.editingGroup = null;
        // 重新启用分组拖动
        this.setGroupSortableEnabled(true);
        return;
      }

      const newName = this.editingGroupName.trim();
      const group = this.getGroupById(this.editingGroup);
      if (!group || newName == group.name) {
        this.editingGroup = null;
        // 重新启用分组拖动
        this.setGroupSortableEnabled(true);
        return;
      }

      // 更新分组名称
      group.name = newName;

      // 更新存储
      storage.setGroups(this.groups);
      this.$storage.reOrderAndStore(this.connections);

      // 刷新连接列表
      this.initConnections();
      this.editingGroup = null;

      // 重新启用分组拖动
      this.setGroupSortableEnabled(true);

      this.$message.success(this.$t('message.save_group_success'));
    },
    deleteGroup(groupId) {
      if (groupId == 1) { // 默认分组不能删除
        return;
      }
      this.$confirm(this.$t('message.delete_group_confirm'), this.$t('message.warning'), {
        confirmButtonText: this.$t('message.confirm'),
        cancelButtonText: this.$t('message.cancel'),
        type: 'warning'
      }).then(() => {
        // 将该分组的所有连接移到默认分组
        this.connections.forEach(conn => {
          if (conn.groupId == groupId) {
            conn.groupId = 1;
          }
        });

        // 删除分组
        storage.deleteGroup(groupId);

        // 从 groupOrder 中删除
        const orderIndex = this.groupOrder.indexOf(groupId);
        if (orderIndex > -1) {
          this.groupOrder.splice(orderIndex, 1);
        }

        // 从 collapsedGroups 中删除
        const collapsedIndex = this.collapsedGroups.indexOf(groupId);
        if (collapsedIndex > -1) {
          this.collapsedGroups.splice(collapsedIndex, 1);
        }

        // 保存更改
        this.$storage.reOrderAndStore(this.connections);
        this.saveGroupOrder();
        this.saveCollapsedGroups();

        // 刷新连接列表
        this.initConnections();
        this.$message.success(this.$t('message.delete_group_success'));
      }).catch(() => { });
    },
    onGroupDragStart(event) {
      const header = event.target.closest('.group-header');
      if (!header) return;

      header.classList.add('dragging');
      event.dataTransfer.setData('text/plain', header.dataset.group);
    },
    onGroupDragEnd(event) {
      const header = event.target.closest('.group-header');
      if (!header) return;

      header.classList.remove('dragging');
    },
    initSortable() {
      // 清理之前的实例
      this.sortableInstances.forEach(instance => instance.destroy());
      this.sortableInstances = [];

      // 为分组列表创建 Sortable 实例
      this.$nextTick(() => {
        const groupsList = this.$refs.groupsList;
        const sortable = new Sortable(groupsList, {
          handle: '.group-header',
          animation: 150,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          forceFallback: true,
          fallbackClass: 'sortable-fallback',
          fallbackOnBody: true,
          scroll: true,
          scrollSensitivity: 30,
          scrollSpeed: 10,
          direction: 'vertical',
          preventOnFilter: true,
          draggable: '.connection-group',
          invertSwap: true,
          swapThreshold: 0.5,
          onStart: (evt) => {
            this.dragStartY = evt.clientY;
            this.dragStartX = evt.clientX;
          },
          onMove: (evt) => {
            const deltaY = Math.abs(evt.clientY - this.dragStartY);
            const deltaX = Math.abs(evt.clientX - this.dragStartX);
            if (deltaX > deltaY) {
              return false;
            }
            return true;
          },
          onEnd: (evt) => {
            const newOrder = [];
            const groups = groupsList.querySelectorAll('.connection-group');
            groups.forEach(group => {
              const groupId = group.querySelector('.group-header').dataset.group;
              newOrder.push(groupId);
            });
            this.groupOrder = newOrder;
            this.saveGroupOrder();
          }
        });
        this.sortableInstances.push(sortable);

        // 为每个分组内的连接创建 Sortable 实例
        const groupContainers = document.querySelectorAll('.group-connections');
        groupContainers.forEach(container => {
          const sortable = new Sortable(container, {
            group: 'connections',
            handle: '.connection-header',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            forceFallback: true,
            fallbackClass: 'sortable-fallback',
            fallbackOnBody: true,
            scroll: true,
            scrollSensitivity: 30,
            scrollSpeed: 10,
            direction: 'vertical',
            preventOnFilter: true,
            filter: '.connection-opt-icons, .connection-opt-icons *',
            invertSwap: true,
            swapThreshold: 0.5,
            delay: 50,
            delayOnTouchOnly: false,
            distance: 10,
            onStart: (evt) => {
              this.dragStartY = evt.clientY;
              this.dragStartX = evt.clientX;
            },
            onMove: (evt) => {
              const deltaY = Math.abs(evt.clientY - this.dragStartY);
              const deltaX = Math.abs(evt.clientX - this.dragStartX);
              if (deltaX > deltaY) {
                return false;
              }
              return true;
            },
            onEnd: (evt) => {
              const targetGroupId = evt.to.dataset.group;
              const sourceGroupId = evt.from.dataset.group;
              const connectionKey = evt.item.dataset.key;

              if (sourceGroupId == targetGroupId) {
                // 同一分组内移动，更新连接顺序
                const newConnections = [];
                const groupConnections = this.connections.filter(conn =>
                  (conn.groupId || 1) == targetGroupId
                );

                // 获取分组内所有连接的新顺序
                const groupContainer = evt.to;
                const connectionElements = groupContainer.querySelectorAll('.connection-wrapper');
                connectionElements.forEach(element => {
                  const key = element.dataset.key;
                  const connection = groupConnections.find(conn => conn.key == key);
                  if (connection) {
                    newConnections.push(connection);
                  }
                });

                // 更新连接顺序
                this.connections = this.connections.filter(conn =>
                  (conn.groupId || 1) != targetGroupId
                );
                this.connections.push(...newConnections);
              } else {
                // 不同分组间移动，更新连接的分组
                const connection = this.connections.find(conn => conn.key == connectionKey);
                if (connection) {
                  connection.groupId = targetGroupId == 1 ? null : targetGroupId;
                }
              }

              // 保存更改
              this.$storage.reOrderAndStore(this.connections);
              this.initConnections();
            }
          });
          this.sortableInstances.push(sortable);
        });
      });
    },
    initCollapsedGroups() {
      // 从 localStorage 获取保存的折叠状态
      const savedCollapsedGroups = localStorage.getItem('collapsedGroups');
      if (savedCollapsedGroups) {
        this.collapsedGroups = JSON.parse(savedCollapsedGroups);
      }
    },
    saveCollapsedGroups() {
      localStorage.setItem('collapsedGroups', JSON.stringify(this.collapsedGroups));
    },
    isGroupCollapsed(groupId) {
      return this.collapsedGroups.includes(groupId);
    },
    toggleGroupCollapse(groupId) {
      if (this.isDragging) return;

      // 使用 nextTick 确保在 DOM 更新后执行
      this.$nextTick(() => {
        const index = this.collapsedGroups.indexOf(groupId);
        if (index == -1) {
          this.collapsedGroups.push(groupId);
        } else {
          this.collapsedGroups.splice(index, 1);
        }
        this.saveCollapsedGroups();
      });
    },
    setGroupSortableEnabled(enabled) {
      // 找到分组的 Sortable 实例（第一个实例是分组拖动实例）
      if (this.sortableInstances.length > 0) {
        const groupSortable = this.sortableInstances[0];
        if (groupSortable && groupSortable.option) {
          groupSortable.option('disabled', !enabled);
        }
      }
    },
    cancelEditGroup() {
      this.editingGroup = null;
      // 重新启用分组拖动
      this.setGroupSortableEnabled(true);
    }
  },
  mounted() {
    this.initConnections();
  },
  beforeDestroy() {
    // 清理 Sortable 实例
    this.sortableInstances.forEach(instance => instance.destroy());
  }
};
</script>

<style type="text/css">
.connections-wrap {
  height: calc(100vh - 59px);
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 11px;
}

.connections-header {
  display: flex;
  align-items: center;
  margin: 0 13px 4px 0;
}

.connections-wrap .filter-input {
  flex: 1;
}

.new-group-btn {
  margin-left: 8px;
}

.connections-wrap .connections-list {
  min-height: calc(100vh - 110px);
}

.connection-group {
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 16px;
  font-size: 13px;
  color: #909399;
  font-weight: bold;
  background-color: #f5f7fa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  transition: background-color 0.2s;
  position: relative;
  z-index: 1;
  min-height: 24px;
}

.group-header-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 0;
}

.group-header-left:hover {
  background-color: transparent;
}

.dark-mode .group-header-left:hover {
  background-color: transparent;
}

.group-header-right {
  display: flex;
  align-items: center;
  cursor: move;
  padding: 0;
  margin-left: 8px;
}

.group-header-right:hover {
  background-color: transparent;
}

.dark-mode .group-header-right:hover {
  background-color: transparent;
}

.collapse-icon {
  margin-right: 6px;
  transition: transform 0.3s;
  font-size: 12px;
  color: #909399;
  line-height: 24px;
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.group-actions {
  display: flex;
  align-items: center;
}

.group-action-btn {
  padding: 0 2px;
  height: 20px;
  line-height: 20px;
}

.group-action-btn i {
  font-size: 13px;
}

.group-name-input {
  flex: 1;
  margin-right: 8px;
}

.group-name-input .el-input__inner {
  height: 20px;
  line-height: 20px;
  font-size: 13px;
  font-weight: bold;
  color: #909399;
  background-color: transparent;
  border: 1px solid #dcdfe6;
}

.group-name-input .el-input__inner:focus {
  border-color: #409eff;
}

.dark-mode .group-header {
  background-color: #2b2b2b;
  color: #909399;
}

.dark-mode .group-name-input .el-input__inner {
  background-color: transparent;
  color: #909399;
  border-color: #4c4d4f;
}

.dark-mode .group-name-input .el-input__inner:focus {
  border-color: #409eff;
}

.dark-mode .group-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Connection indentation */
.connection-group .connection-menu {
  margin-left: 16px;
  margin-top: 4px;
}

.connection-group .connection-menu .el-submenu__title {
  padding-left: 16px !important;
}

.connection-group .connection-menu .el-menu-item {
  padding-left: 16px !important;
}

.connection-group .connection-menu .el-submenu .el-menu-item {
  padding-left: 28px !important;
}

/* Drag and drop styles */
.connection-wrapper {
  cursor: default;
}

.connection-header {
  cursor: default;
}

.connection-wrapper.dragging {
  opacity: 0.5;
}

.group-connections {
  min-height: 28px;
  transition: background-color 0.2s;
  padding-top: 4px;
}

.group-connections.drag-over {
  background-color: rgba(64, 158, 255, 0.1);
}

.dark-mode .group-connections.drag-over {
  background-color: rgba(64, 158, 255, 0.2);
}

/* Sortable styles */
.sortable-fallback {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.dark-mode .sortable-fallback {
  background: #1f1f1f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sortable-ghost {
  opacity: 0.5;
  background: #f0f0f0;
  pointer-events: none;
}

.sortable-drag {
  opacity: 0.8;
  background: #fff;
  pointer-events: none;
}

.dark-mode .sortable-ghost {
  background: #2b2b2b;
}

.dark-mode .sortable-drag {
  background: #1f1f1f;
}

.group-header.dragging {
  opacity: 0.5;
  z-index: 2;
}

.connection-group.sortable-ghost {
  z-index: 0;
}
</style>
