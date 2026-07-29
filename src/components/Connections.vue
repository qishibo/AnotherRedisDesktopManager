<template>
  <div class="connections-wrap">
    <!-- search connections input -->
    <div v-if="connections.length>=filterEnableNum" class="filter-input">
      <el-input
        v-model="filterMode"
        suffix-icon="el-icon-search"
        :placeholder="$t('message.search_connection')"
        clearable
        size="mini">
      </el-input>
    </div>

    <!-- connections list -->
    <div ref="connectionsList" class="connections-list">
      <!-- grouped connection -->
      <el-collapse class="group-outer-collapse">
        <!-- map groups -->
        <el-collapse-item
          v-for="group in groups"
          v-if="!filterKeyword || connectionsByGroupId[group.id].length"
          :key="group.id"
          :name="group.id">
          <template slot="title">
            <i class="fa fa-folder-o group-icon"></i>
            <span class="group-title">{{ group.name }}</span>
            <span class="group-count">{{ connectionsByGroupId[group.id].length }}</span>
            <span class="group-actions" @click.stop>
              <!-- edit group -->
              <el-button
                type="text"
                icon="el-icon-edit"
                :title="$t('message.edit_group')"
                @click="openEditGroupDialog(group)">
              </el-button>
              <!-- del group -->
              <el-button
                type="text"
                icon="el-icon-delete"
                :title="$t('el.upload.delete')"
                @click="deleteGroup(group.id)">
              </el-button>
            </span>
          </template>
          <!-- group list container -->
          <div class="group-connection-wrap grouped-list" :data-group-id="group.id">
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

      <!-- ungrouped connection -->
      <template v-if="showUngroupedArea">
        <!-- if no groups, hidden label -->
        <div v-if="groups.length" class="ungrouped-label">{{ $t('message.ungrouped') }}</div>
        <div class="group-connection-wrap ungrouped-list">
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

    <!-- edit group dialog -->
    <el-dialog
      :title="$t('message.edit_group')"
      :visible.sync="showGroupDialog"
      width="400px"
      append-to-body>
      <el-form @submit.native.prevent="handleGroupSubmit">
        <el-form-item :label="$t('message.group_name')">
          <el-input
            v-model="groupForm.name"
            :placeholder="$t('message.group_name')">
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

export default {
  data() {
    return {
      connections: [],
      globalSettings: this.$storage.getSetting(),
      filterEnableNum: 4,
      filterMode: '',
      groups: [],
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
    this.$bus.$on('groups-updated', this.initGroups);
  },
  computed: {
    filterKeyword() {
      return this.filterMode.trim().toLowerCase();
    },
    filteredConnections() {
      if (!this.filterKeyword) {
        return this.connections;
      }

      return this.connections.filter(item => item.name.toLowerCase().includes(this.filterKeyword));
    },
    connectionsByGroupId() {
      const grouped = {};
      this.groups.forEach(group => { grouped[group.id] = []; });

      this.filteredConnections.forEach((conn) => {
        if (conn.groupId && grouped[conn.groupId]) {
          grouped[conn.groupId].push(conn);
        }
      });

      return grouped;
    },
    ungroupedConnections() {
      const groupedIds = new Set(this.groups.map(group => group.id));

      return this.filteredConnections.filter(
        conn => !conn.groupId || !groupedIds.has(conn.groupId),
      );
    },
    showUngroupedArea() {
      return this.ungroupedConnections.length > 0 || (!this.filterKeyword && this.groups.length > 0);
    },
  },
  watch: {
    filterMode() {
      // reinit sortable while changing
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

      // DOM tree order === group lists then ungrouped list
      root.querySelectorAll('.connection-item').forEach((el) => {
        const conn = byName.get(el.dataset.connectionName);

        if (conn) {
          ordered.push(conn);
          used.add(this.connKey(conn));
        }
      });

      // keep connections not in DOM (e.g. filtered out)
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

      // current connection(drag start)
      const conn = this.connections.find(
        item => item.connectionName === evt.item.dataset.connectionName,
      );

      if (!conn) {
        return;
      }

      conn.groupId = evt.to.dataset.groupId || null;
      // resort connection's order
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
      this.$message.success(this.$t('message.modify_success'));
      this.$bus.$emit('groups-updated');
    },
    deleteGroup(groupId) {
      this.$confirm(this.$t('message.delete_group_confirm'), { type: 'warning' }).then(() => {
        storage.deleteGroup(groupId);
        this.$message.success(this.$t('message.delete_success'));
        // reload connections so in-memory groupId is cleared(in connections)
        this.initConnections();
      }).catch(() => {});
    },
    initGroups() {
      this.groups = storage.getGroups();
      this.initSortable();
    },
    initConnections() {
      this.connections = storage.getConnections(true).map((item) => {
        item.connectionName = storage.getConnectionName(item);
        // fix history bug, prevent db into config
        delete item.db;
        return item;
      });
      this.initGroups();
    },
    destroySortables() {
      this.sortables.forEach(sortable => sortable.destroy());
      this.sortables = [];
    },
    initSortable() {
      this.destroySortables();

      // disable sortable while filtering
      if (this.filterKeyword) {
        return;
      }

      this.$nextTick(() => {
        const root = this.$refs.connectionsList;

        if (!root) {
          return;
        }

        // create drag area for every connections in group,
        // belongs to same group 'connections'
        const connAreas = root.querySelectorAll('.group-connection-wrap');
        connAreas.forEach((listEl) => {
          this.sortables.push(Sortable.create(listEl, {
            group: 'connections',
            handle: '.el-submenu__title',
            animation: 400,
            direction: 'vertical',
            draggable: '.connection-item',
            onEnd: this.onConnectionDragEnd,
          }));
        });

        // create drag area for every group
        const groupArea = root.querySelector('.group-outer-collapse');
        if (groupArea) {
          this.sortables.push(Sortable.create(groupArea, {
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
  .connections-wrap .filter-input {
    padding-right: 6px;
    margin-bottom: 4px;
  }
  /* set drag area min height, target to the end will be correct */
  .connections-wrap .connections-list {
    min-height: calc(100vh - 110px);
  }
  /* group style */
  .connections-wrap .el-collapse {
    border: 0;
  }
  .connections-wrap .el-collapse-item {
    margin-bottom: 8px;
  }
  .connections-wrap .el-collapse-item__header {
    font-size: 13px;
    font-weight: 600;
    height: 34px;
    line-height: 34px;
    padding: 0 8px 0 10px;
    margin-right: 6px;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    background: #f0f2f5;
    border-radius: 4px;
    border-bottom: 0 !important;
    color: #606266;
  }
  .connections-wrap .el-collapse-item__header:hover {
    background: #e6e8eb;
  }
  .dark-mode .connections-wrap .el-collapse-item__header {
    background: #2c3a41;
    color: #c0c4cc;
  }
  .dark-mode .connections-wrap .el-collapse-item__header:hover {
    background: #35454e;
  }
  /*opened group*/
  .connections-wrap .el-collapse-item.is-active .el-collapse-item__header {
    border-radius: 4px 4px 0 0;
  }
  .connections-wrap .el-collapse-item__wrap {
    border-bottom: 0 !important;
    background: transparent;
  }
  .connections-wrap .el-collapse-item__arrow {
    margin-right: 2px;
    color: #909399;
  }
  .connections-wrap .group-icon {
    margin-right: 6px;
    color: #909399;
  }
  .connections-wrap .group-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: grab;
    letter-spacing: 0.2px;
  }
  .connections-wrap .group-title:active,
  .connections-wrap .sortable-chosen .group-title {
    cursor: grabbing;
  }
  .connections-wrap .group-count {
    flex-shrink: 0;
    min-width: 18px;
    height: 18px;
    margin-left: 6px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: normal;
    line-height: 18px;
    text-align: center;
    color: #909399;
    background: #fff;
    border-radius: 9px;
  }
  .dark-mode .connections-wrap .group-count {
    background: #1e272c;
    color: #909399;
  }
  .connections-wrap .group-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    opacity: 0.55;
  }
  .connections-wrap .el-collapse-item__header:hover .group-actions {
    opacity: 1;
  }
  .connections-wrap .group-actions .el-button {
    padding: 0;
    margin-left: 0;
    font-size: 14px;
    color: #909399;
  }
  .connections-wrap .group-actions .el-button:hover {
    color: #589ce2;
  }
  .connections-wrap .el-collapse-item__content {
    padding-bottom: 0px;
  }

  /* grouped & ungrouped list area */
  .connections-wrap .group-connection-wrap {
    min-height: 26px;
  }
  .connections-wrap .ungrouped-label {
    font-size: 12px;
    font-weight: 600;
    color: #909399;
    margin: 10px 8px 6px;
    padding-top: 8px;
    border-top: 1px dashed #dcdfe6;
    letter-spacing: 0.3px;
  }
  .dark-mode .connections-wrap .ungrouped-label {
    border-top-color: #3d4f57;
  }

  /*sortable styles*/
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
