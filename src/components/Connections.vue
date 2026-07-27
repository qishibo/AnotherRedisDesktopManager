<template>
  <div class="connections-wrap">
    <div v-if="connections.length>=filterEnableNum" class="connections-toolbar">
      <div class="filter-input">
        <el-input
          v-model="filterMode"
          suffix-icon="el-icon-search"
          :placeholder="$t('message.search_connection')"
          clearable
          size="mini">
        </el-input>
      </div>
    </div>

    <div ref="connectionsList" class="connections-list">
      <el-collapse v-if="visibleGroups.length" v-model="activeGroups">
        <el-collapse-item
          v-for="group in visibleGroups"
          :key="group.id"
          :name="group.id">
          <template slot="title">
            <span class="group-title">{{ group.name }}</span>
            <span class="group-count">({{ connectionsByGroupId[group.id].length }})</span>
            <span class="group-actions" @click.stop>
              <el-button
                type="text"
                icon="el-icon-edit"
                :title="$t('message.edit_group')"
                @click="openEditGroupDialog(group)">
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                :title="$t('el.upload.delete')"
                @click="deleteGroup(group.id)">
              </el-button>
            </span>
          </template>
          <div class="drop-list group-list" :data-group-id="group.id">
            <div
              v-for="(item, index) in connectionsByGroupId[group.id]"
              :key="connKey(item)"
              class="connection-item"
              :data-connection-name="item.connectionName">
              <ConnectionWrapper
                :index="index"
                :globalSettings="globalSettings"
                :config='item'>
              </ConnectionWrapper>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <template v-if="showUngroupedArea">
        <div v-if="groups.length" class="ungrouped-label">{{ $t('message.ungrouped') }}</div>
        <div class="drop-list ungrouped-list">
          <div
            v-for="(item, index) in ungroupedConnections"
            :key="connKey(item)"
            class="connection-item"
            :data-connection-name="item.connectionName">
            <ConnectionWrapper
              :index="index"
              :globalSettings="globalSettings"
              :config='item'>
            </ConnectionWrapper>
          </div>
        </div>
      </template>
    </div>

    <ScrollToTop parentNum='1' :posRight='false'></ScrollToTop>

    <el-dialog
      :title="$t('message.edit_group')"
      :visible.sync="showGroupDialog"
      width="360px"
      append-to-body>
      <el-form label-width="80px" @submit.native.prevent="handleGroupSubmit">
        <el-form-item :label="$t('message.group_name')">
          <el-input
            v-model="groupForm.name"
            :placeholder="$t('message.group_name')"
            @keyup.enter.native="handleGroupSubmit">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showGroupDialog = false">{{ $t('message.close') }}</el-button>
        <el-button type="primary" @click="handleGroupSubmit">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import ConnectionWrapper from '@/components/ConnectionWrapper';
import ScrollToTop from '@/components/ScrollToTop';
import Sortable from 'sortablejs';

const CONN_SORTABLE_OPTIONS = {
  group: 'connections',
  handle: '.el-submenu__title',
  animation: 400,
  direction: 'vertical',
  draggable: '.connection-item',
};

export default {
  data() {
    return {
      connections: [],
      globalSettings: this.$storage.getSetting(),
      filterEnableNum: 4,
      filterMode: '',
      groups: [],
      activeGroups: [],
      showGroupDialog: false,
      groupForm: { id: '', name: '' },
      sortables: [],
    };
  },
  components: { ConnectionWrapper, ScrollToTop },
  created() {
    this.$bus.$on('refreshConnections', this.initConnections);
    this.$bus.$on('reloadSettings', (settings) => {
      this.globalSettings = settings;
    });
    this.$bus.$on('groups-updated', this.reloadGroups);
  },
  beforeDestroy() {
    this.$bus.$off('refreshConnections', this.initConnections);
    this.$bus.$off('groups-updated', this.reloadGroups);
    this.destroySortables();
  },
  computed: {
    filterKeyword() {
      return this.filterMode.trim().toLowerCase();
    },
    filteredConnections() {
      if (!this.filterKeyword) {
        return this.connections;
      }

      return this.connections.filter(item => item.connectionName.toLowerCase().includes(this.filterKeyword));
    },
    connectionsByGroupId() {
      const map = {};
      this.groups.forEach(group => { map[group.id] = []; });

      this.filteredConnections.forEach((conn) => {
        if (conn.groupId && map[conn.groupId]) {
          map[conn.groupId].push(conn);
        }
      });

      return map;
    },
    visibleGroups() {
      if (!this.filterKeyword) {
        return this.groups;
      }

      return this.groups.filter(group => this.connectionsByGroupId[group.id].length > 0);
    },
    ungroupedConnections() {
      return this.filteredConnections.filter(conn => !conn.groupId);
    },
    showUngroupedArea() {
      return this.ungroupedConnections.length > 0 || (!this.filterKeyword && this.groups.length > 0);
    },
  },
  watch: {
    filterMode() {
      const visibleIds = new Set(this.visibleGroups.map(group => group.id));
      this.activeGroups = this.activeGroups.filter(id => visibleIds.has(id));
      this.initSortable();
    },
  },
  methods: {
    connKey(item) {
      return item.key || item.connectionName;
    },
    syncConnectionsOrder() {
      const root = this.$refs.connectionsList;

      if (!root) {
        return;
      }

      const byName = new Map(this.connections.map(conn => [conn.connectionName, conn]));
      const ordered = [];
      const used = new Set();

      const addFromList = (listEl) => {
        if (!listEl) {
          return;
        }

        [...listEl.children].forEach((child) => {
          const conn = byName.get(child.dataset.connectionName);

          if (conn) {
            ordered.push(conn);
            used.add(this.connKey(conn));
          }
        });
      };

      this.groups.forEach(({ id }) => addFromList(root.querySelector(`.group-list[data-group-id="${id}"]`)));
      addFromList(root.querySelector('.ungrouped-list'));
      this.connections.forEach((conn) => {
        if (!used.has(this.connKey(conn))) {
          ordered.push(conn);
        }
      });

      this.connections = ordered;
      this.$storage.reOrderAndStore(this.connections);
    },
    onConnectionDragEnd(evt) {
      if (evt.from === evt.to && evt.oldIndex === evt.newIndex) {
        return;
      }

      const conn = this.connections.find(item => item.connectionName === evt.item.dataset.connectionName);

      if (!conn) {
        return;
      }

      conn.groupId = evt.to.dataset.groupId || null;
      this.syncConnectionsOrder();
      this.initSortable();
    },
    onGroupOrderEnd({ newIndex, oldIndex }) {
      if (newIndex === oldIndex) {
        return;
      }

      const groups = [...this.groups];
      groups.splice(newIndex, 0, groups.splice(oldIndex, 1)[0]);
      this.groups = groups;
      storage.setGroups(groups);
    },
    openEditGroupDialog(group) {
      this.groupForm = { id: group.id, name: group.name };
      this.showGroupDialog = true;
    },
    handleGroupSubmit() {
      const name = this.groupForm.name.trim();

      if (!name) {
        return this.$message.error(this.$t('message.group_name_required'));
      }

      if (!storage.renameGroup(this.groupForm.id, name)) {
        return this.$message.error(this.$t('message.group_exists'));
      }

      this.showGroupDialog = false;
      this.groupForm = { id: '', name: '' };
      this.reloadGroups();
      this.$message.success(this.$t('message.modify_success'));
      this.$bus.$emit('groups-updated');
    },
    deleteGroup(groupId) {
      this.$confirm(this.$t('message.delete_group_confirm'), { type: 'warning' }).then(() => {
        storage.deleteGroup(groupId);
        this.initConnections();
        this.$message.success(this.$t('message.delete_success'));
        this.$bus.$emit('groups-updated');
      }).catch(() => {});
    },
    reloadGroups() {
      this.groups = storage.getGroups();
      this.initSortable();
    },
    initConnections() {
      const groupIds = new Set(storage.getGroups().map(group => group.id));

      this.connections = storage.getConnections(true).map((item) => {
        item.connectionName = storage.getConnectionName(item);
        delete item.db;
        item.groupId = item.groupId && groupIds.has(item.groupId) ? item.groupId : null;
        return item;
      });
      this.reloadGroups();
    },
    destroySortables() {
      this.sortables.forEach(sortable => sortable.destroy());
      this.sortables = [];
    },
    initSortable() {
      this.destroySortables();

      if (this.filterKeyword) {
        return;
      }

      this.$nextTick(() => {
        const root = this.$refs.connectionsList;

        if (!root) {
          return;
        }

        root.querySelectorAll('.drop-list').forEach((listEl) => {
          this.sortables.push(Sortable.create(listEl, {
            ...CONN_SORTABLE_OPTIONS,
            onEnd: this.onConnectionDragEnd,
          }));
        });

        const collapseEl = root.querySelector('.el-collapse');

        if (collapseEl) {
          this.sortables.push(Sortable.create(collapseEl, {
            handle: '.group-title',
            animation: 400,
            direction: 'vertical',
            draggable: '.el-collapse-item',
            onEnd: this.onGroupOrderEnd,
          }));
        }
      });
    },
  },
  mounted() {
    this.initConnections();
  },
};
</script>

<style type="text/css">
  .connections-wrap {
    height: calc(100vh - 59px);
    overflow-y: auto;
    margin-top: 11px;
  }
  .connections-wrap .connections-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 13px;
    margin-bottom: 4px;
  }
  .connections-wrap .filter-input {
    flex: 1;
  }
  .connections-wrap .connections-list {
    min-height: calc(100vh - 110px);
  }
  .connections-wrap .el-collapse {
    border: 0;
    padding-right: 7px;
  }
  .connections-wrap .el-collapse-item__header {
    font-size: 13px;
    font-weight: bold;
    padding-left: 8px;
    padding-right: 4px;
    height: 36px;
    line-height: 36px;
    display: flex;
    align-items: center;
  }
  .connections-wrap .group-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: grab;
  }
  .connections-wrap .group-title:active,
  .connections-wrap .sortable-chosen .group-title {
    cursor: grabbing;
  }
  .connections-wrap .group-count {
    flex-shrink: 0;
    margin-left: 6px;
    margin-right: 4px;
    font-size: 12px;
    font-weight: normal;
    color: #909399;
  }
  .connections-wrap .group-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }
  .connections-wrap .group-actions .el-button {
    padding: 0;
    margin-left: 0;
    font-size: 14px;
  }
  .connections-wrap .el-collapse-item__content {
    padding-bottom: 0;
  }
  .connections-wrap .drop-list {
    min-height: 8px;
  }
  .connections-wrap .ungrouped-label {
    font-size: 13px;
    font-weight: bold;
    color: #909399;
    padding: 4px 8px 0;
  }
  .connections-wrap .sortable-ghost {
    opacity: 1 !important;
    background: #ecf5ff !important;
    border: 2px dashed #409eff !important;
    border-radius: 4px;
  }
  .connections-wrap .sortable-drag {
    opacity: 1 !important;
    background: #fff !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18) !important;
    border: 1px solid #409eff !important;
    border-radius: 4px;
  }
  .connections-wrap .sortable-chosen {
    opacity: 0.5;
  }
  .dark-mode .connections-wrap .sortable-ghost {
    background: #1e3a5f !important;
    border-color: #409eff !important;
  }
  .dark-mode .connections-wrap .sortable-drag {
    background: #263238 !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45) !important;
  }
</style>
