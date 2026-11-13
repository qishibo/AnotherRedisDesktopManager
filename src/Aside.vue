<template>
  <div class="aside-outer-container">
    <!-- 顶部工具栏：始终可见 -->
    <div class="aside-top-container">
      <div class="aside-toolbar">
        <el-button class="aside-new-connection-btn" type="info" @click="addNewConnection" icon="el-icon-circle-plus" :title='$t("message.new_connection")+" Ctrl+n"'>{{ $t('message.new_connection') }}</el-button>
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-setting" @click="$refs.settingDialog.show()" :title='$t("message.settings")+" Ctrl+,"' plain></el-button>
        <el-button class='aside-setting-btn' type="primary" icon="el-icon-time" @click="$refs.commandLogDialog.show()" :title='$t("message.command_log")+" Ctrl+g"' plain></el-button>
      </div>

      <!-- 批量导入导出 -->
      <div class="aside-import-export-container">
        <el-button size="mini" icon="el-icon-upload2" @click="triggerImportConnections">
          {{ $t('message.import_connections') }}
        </el-button>
        <el-button size="mini" icon="el-icon-download" @click="exportConnections">
          {{ $t('message.export_connections') }}
        </el-button>
      </div>
    </div>

    <!-- 连接列表：占据剩余空间 -->
    <Connections ref="connections" class="aside-connections-area"></Connections>

    <!-- 弹窗组件 -->
    <NewConnectionDialog
      @editConnectionFinished="editConnectionFinished"
      ref="newConnectionDialog">
    </NewConnectionDialog>
    <Setting ref="settingDialog"></Setting>
    <CommandLog ref='commandLogDialog'></CommandLog>
    <HotKeys ref='hotKeysDialog'></HotKeys>
    <CustomFormatter></CustomFormatter>

    <!-- 导入冲突选择弹窗 -->
    <el-dialog
      :title="$t('message.import_connections_conflict_title')"
      :visible.sync="importConflictDialogVisible"
      width="460px"
      append-to-body
      :close-on-click-modal="false">
      <div class="import-conflict-info">
        <p>{{ $t('message.import_connections_conflict_desc', { count: importConflictInfo.conflictCount }) }}</p>
        <p v-if="importConflictInfo.newCount > 0" class="import-conflict-new">
          {{ $t('message.import_connections_new_count', { count: importConflictInfo.newCount }) }}
        </p>
      </div>
      <span slot="footer">
        <el-button @click="importConflictDialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="doImportConnections('skip')">
          {{ $t('message.import_skip_all') }}
        </el-button>
        <el-button type="warning" @click="doImportConnections('overwrite')">
          {{ $t('message.import_overwrite_all') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import Setting from '@/components/Setting';
import Connections from '@/components/Connections';
import NewConnectionDialog from '@/components/NewConnectionDialog';
import CommandLog from '@/components/CommandLog';
import HotKeys from '@/components/HotKeys';
import CustomFormatter from '@/components/CustomFormatter';
import { remote } from 'electron';

export default {
  data() {
    return {
      // 导入相关
      importConflictDialogVisible: false,
      importConflictInfo: {
        servers: [],
        conflictCount: 0,
        newCount: 0,
      },
    };
  },
  components: {
    Connections, NewConnectionDialog, Setting, CommandLog, HotKeys, CustomFormatter,
  },
  methods: {
    editConnectionFinished() {
      this.$refs.connections.initConnections();
    },
    addNewConnection() {
      this.$refs.newConnectionDialog.show();
    },

    /** 导出所有连接配置为 JSON 文件 */
    exportConnections() {
      const json = storage.exportConnections();

      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const fileName = `redis-connections-${ts}.json`;

      remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: this.$t('message.export_connections'),
        defaultPath: fileName,
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }).then((result) => {
        if (result.canceled || !result.filePath) {
          return;
        }

        try {
          require('fs').writeFileSync(result.filePath, json, 'utf8');
          this.$message.success(this.$t('message.export_success'));
        } catch (e) {
          this.$message.error(`${this.$t('message.export_failed')}: ${e.message}`);
        }
      });
    },

    /** 触发导入流程：选择文件 → 解析 → 校验 → 冲突处理 → 执行 */
    triggerImportConnections() {
      remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: this.$t('message.import_connections'),
        properties: ['openFile'],
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }).then((result) => {
        if (result.canceled || !result.filePaths || !result.filePaths.length) {
          return;
        }

        const filePath = result.filePaths[0];
        let raw;

        try {
          raw = require('fs').readFileSync(filePath, 'utf8');
        } catch (e) {
          return this.$message.error(`${this.$t('message.import_failed')}: ${e.message}`);
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          return this.$message.error(`${this.$t('message.import_parse_failed')}: ${e.message}`);
        }

        // 兼容两种格式：{servers: [...]} 或直接数组 [...]
        const servers = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.servers) ? parsed.servers : null);
        if (!servers) {
          return this.$message.error(this.$t('message.import_format_error'));
        }
        if (!servers.length) {
          return this.$message.warning(this.$t('message.import_empty_file'));
        }

        // 校验
        const { errors, validServers } = storage.validateServers(servers);
        if (errors.length > 0) {
          return this.$alert(
            errors.join('<br/>'),
            this.$t('message.import_validation_failed'),
            { type: 'error', dangerouslyUseHTMLString: true },
          );
        }

        // 冲突检测
        const existing = storage.getConnections(true);
        const existingKeys = new Set(existing.map(c => storage.getConnectionKey(c)));
        let conflictCount = 0;
        let newCount = 0;

        validServers.forEach((srv) => {
          if (existingKeys.has(storage.getConnectionKey(srv))) {
            conflictCount++;
          } else {
            newCount++;
          }
        });

        // 无冲突：直接导入
        if (conflictCount === 0) {
          const res = storage.importConnections(validServers, 'skip');
          this.$bus.$emit('refreshConnections');
          return this.$message.success(
            this.$t('message.import_result', { added: res.added, skipped: 0, overwritten: 0 }),
          );
        }

        // 有冲突：弹窗让用户选择
        this.importConflictInfo = { servers: validServers, conflictCount, newCount };
        this.importConflictDialogVisible = true;
      });
    },

    /** 执行实际导入（由冲突弹窗触发） */
    doImportConnections(mode) {
      this.importConflictDialogVisible = false;

      const res = storage.importConnections(this.importConflictInfo.servers, mode);
      this.$bus.$emit('refreshConnections');

      let msg = this.$t('message.import_result', {
        added: res.added, skipped: res.skipped, overwritten: res.overwritten,
      });
      this.$message.success(msg);
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
  /* 让外层容器占满高度，flex 列布局 */
  .aside-outer-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .aside-top-container {
    flex-shrink: 0;
    padding: 4px 8px 8px 8px;
    border-bottom: 1px solid #e4e0e0;
  }
  .aside-top-container .aside-toolbar {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }
  .aside-top-container .aside-toolbar .aside-setting-btn {
    flex-shrink: 0;
    width: 36px;
  }
  .aside-top-container .aside-toolbar .aside-new-connection-btn {
    flex: 1;
  }
  /* 批量导入导出 */
  .aside-top-container .aside-import-export-container {
    display: flex;
    gap: 6px;
  }
  .aside-import-export-container .el-button {
    flex: 1;
  }

  /* 连接列表占剩余空间 */
  .aside-connections-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .import-conflict-info p {
    margin: 6px 0;
    line-height: 1.6;
  }
  .import-conflict-info .import-conflict-new {
    color: #67c23a;
  }

  .dark-mode .aside-top-container {
    border-bottom-color: #3d4f57;
  }
  .dark-mode .aside-top-container .el-button--info {
    color: #52a6fd;
    background: inherit;
  }
</style>
