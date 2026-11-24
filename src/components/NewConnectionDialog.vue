<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :append-to-body='true' :close-on-click-modal='false' class='new-connection-dailog' width='90%'>
    <el-tabs v-model="activeTab" class="connection-tabs">
      <!-- General tab -->
      <el-tab-pane :label="$t('message.common_settings')" name="general">
        <el-form label-position="top" label-width="90px">
          <!-- connection name and host/port -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.connection_name')">
                <el-input v-model="connection.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item required>
                <span slot="label">
                  {{ $t('message.host') }} / {{ $t('message.port') }}
                </span>
                <div class="host-port-row">
                  <el-input
                    v-model="connection.host"
                    class="host-input"
                    placeholder="127.0.0.1">
                  </el-input>
                  <el-input
                    type="number"
                    v-model="connection.port"
                    class="port-input"
                    placeholder="6379">
                  </el-input>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- password and username -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.password')">
                <InputPassword v-model="connection.auth" :hidepass="editMode" placeholder="Auth"></InputPassword>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.username')">
                <el-input v-model="connection.username" placeholder='ACL in Redis >= 6.0'></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- separator and group -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item>
                <span slot="label">
                  {{ $t('message.separator') }}
                  <el-popover trigger="hover" :tabindex="-1">
                    <i slot="reference" class="el-icon-question"></i>
                    {{ $t('message.separator_tip') }}
                  </el-popover>
                </span>
                <el-input v-model="connection.separator" placeholder='Empty To Disable Tree View'></el-input>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.group')">
                <GroupSelect v-model="connection.groupId"></GroupSelect>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- other connection options -->
          <el-row type="flex" align="top" class="connection-options-row">
            <!-- readonly switch -->
            <el-form-item>
              <span slot="label">
                {{ $t('message.readonly') }}
                <el-popover trigger="hover" :tabindex="-1">
                  <i slot="reference" class="el-icon-question"></i>
                  {{ $t('message.connection_readonly') }}
                </el-popover>
              </span>
              <el-switch v-model="connection.connectionReadOnly"></el-switch>
            </el-form-item>
            <!-- option divider -->
            <span class="connection-option-divider"></span>
            <!-- mark color -->
            <el-form-item :label="$t('message.mark_color')">
              <MarkColorSelect v-model="connection.color"></MarkColorSelect>
            </el-form-item>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- SSH tab -->
      <el-tab-pane name="ssh">
        <span slot="label" class="connection-tab-label">
          SSH
          <sup v-if="sshOptionsShow" class="tab-configured-mark">●</sup>
        </span>

        <div class="tab-enable-row">
          <span class="tab-enable-label">{{ $t('message.connection_enable') }}</span>
          <el-switch v-model="sshOptionsShow"></el-switch>
        </div>

        <el-form v-if="sshOptionsShow" label-position='top' label-width="90px">
          <!-- host and port -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.host')" required>
                <el-input v-model="connection.sshOptions.host"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.port')" required>
                <el-input type='number' v-model="connection.sshOptions.port"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- username and timeout -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.username')" required>
                <el-input v-model="connection.sshOptions.username"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.timeout')">
                <el-input type='number' v-model="connection.sshOptions.timeout" placeholder='SSH Timeout (Seconds)'></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- auth methods -->
          <div class="ssh-auth-section">
            <el-form-item :label="$t('message.ssh_auth')">
              <el-radio-group v-model="connection.sshOptions.authType" class="ssh-auth-type">
                <el-radio label="privatekey">{{ $t('message.private_key') }}</el-radio>
                <el-radio label="password">{{ $t('message.password') }}</el-radio>
                <el-radio label="agent">{{ $t('message.ssh_agent') }}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-row :gutter=20>
              <!-- ssh agent -->
              <el-col v-if="connection.sshOptions.authType === 'agent'" :span=12>
                <el-form-item :label="$t('message.ssh_agent_path')">
                  <el-input
                    v-model="connection.sshOptions.agentPath"
                    :placeholder="$t('message.ssh_agent_path_placeholder')">
                  </el-input>
                </el-form-item>
              </el-col>
              <!-- private key -->
              <template v-else-if="connection.sshOptions.authType === 'privatekey'">
                <el-col :span=12>
                  <el-form-item :label="$t('message.private_key')">
                    <FileInput
                      :file.sync='connection.sshOptions.privatekey'
                      :bookmark.sync='connection.sshOptions.privatekeybookmark'
                      placeholder='SSH Private Key'>
                    </FileInput>
                  </el-form-item>
                </el-col>

                <el-col :span=12>
                  <el-form-item label="Passphrase">
                    <InputPassword v-model="connection.sshOptions.passphrase" placeholder='Passphrase for Private Key'></InputPassword>
                  </el-form-item>
                </el-col>
              </template>
              <!-- password -->
              <el-col v-else :span=12>
                <el-form-item :label="$t('message.password')">
                  <InputPassword v-model="connection.sshOptions.password" placeholder="SSH Password"></InputPassword>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </el-tab-pane>

      <!-- SSL tab -->
      <el-tab-pane name="ssl">
        <span slot="label" class="connection-tab-label">
          TLS/SSL
          <sup v-if="sslOptionsShow" class="tab-configured-mark">●</sup>
        </span>

        <div class="tab-enable-row">
          <span class="tab-enable-label">{{ $t('message.connection_enable') }}</span>
          <el-switch v-model="sslOptionsShow"></el-switch>
        </div>

        <p class="tab-faq">{{ $t('message.ssl_faq') }}</p>

        <el-form v-if="sslOptionsShow" label-position='top' label-width="90px">
          <!-- private key and cert -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.private_key')">
                <FileInput
                  :file.sync='connection.sslOptions.key'
                  :bookmark.sync='connection.sslOptions.keybookmark'
                  placeholder='Private Key Pem (key)'>
                </FileInput>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.public_key')">
                <FileInput
                  :file.sync='connection.sslOptions.cert'
                  :bookmark.sync='connection.sslOptions.certbookmark'
                  placeholder='Public Key Pem (cert)'>
                </FileInput>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- ca and sni -->
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.authority')">
                <FileInput
                  :file.sync='connection.sslOptions.ca'
                  :bookmark.sync='connection.sslOptions.cabookmark'
                  placeholder='Certificate Authority (CA)'>
                </FileInput>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item label="SNI">
                <el-input v-model="connection.sslOptions.servername" placeholder='SNI Servername'></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- Cluster tab -->
      <el-tab-pane name="cluster">
        <span slot="label" class="connection-tab-label">
          Cluster
          <sup v-if="connection.cluster" class="tab-configured-mark">●</sup>
        </span>

        <div class="tab-enable-row">
          <span class="tab-enable-label">{{ $t('message.connection_enable') }}</span>
          <el-switch
            v-model="connection.cluster"
            :disabled="sentinelOptionsShow">
          </el-switch>
          <span v-if="sentinelOptionsShow" class="tab-conflict-hint">{{ $t('message.sentinel_cluster_conflict') }}</span>
        </div>

        <p class="tab-faq">{{ $t('message.cluster_faq') }}</p>
      </el-tab-pane>

      <!-- Sentinel tab -->
      <el-tab-pane name="sentinel">
        <span slot="label" class="connection-tab-label">
          Sentinel
          <sup v-if="sentinelOptionsShow" class="tab-configured-mark">●</sup>
        </span>

        <div class="tab-enable-row">
          <span class="tab-enable-label">{{ $t('message.connection_enable') }}</span>
          <el-switch
            v-model="sentinelOptionsShow"
            :disabled="connection.cluster">
          </el-switch>
          <span v-if="connection.cluster" class="tab-conflict-hint">{{ $t('message.sentinel_cluster_conflict') }}</span>
        </div>

        <p class="tab-faq">{{ $t('message.sentinel_faq') }}</p>

        <el-form v-if="sentinelOptionsShow" label-position='top' label-width="90px">
          <el-row :gutter=20>
            <el-col :span=12>
              <el-form-item :label="$t('message.redis_node_password')">
                <InputPassword v-model="connection.sentinelOptions.nodePassword" placeholder='Redis Node Password'></InputPassword>
              </el-form-item>
            </el-col>

            <el-col :span=12>
              <el-form-item :label="$t('message.master_group_name')" required>
                <el-input v-model="connection.sentinelOptions.masterName" placeholder='Master Group Name'></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- footer operate btn -->
    <div slot="footer" class="dialog-footer">
      <el-button :loading="testing" @click="testConnection">{{ $t('message.test_connection') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="editConnection">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>

  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage';
import redisClient from '@/redisClient.js';
import FileInput from '@/components/FileInput';
import InputPassword from '@/components/InputPassword';
import MarkColorSelect from '@/components/MarkColorSelect';
import GroupSelect from '@/components/GroupSelect';

export default {
  data() {
    return {
      dialogVisible: false,
      testing: false,
      connection: {
        host: '',
        port: '',
        auth: '',
        username: '',
        name: '',
        separator: ':',
        cluster: false,
        connectionReadOnly: false,
        groupId: null,
        color: '',
        sshOptions: {
          host: '',
          port: 22,
          username: '',
          password: '',
          privatekey: '',
          passphrase: '',
          timeout: 30,
          authType: 'privatekey', // privatekey password agent
          agentPath: '',
        },
        sslOptions: {
          key: '',
          cert: '',
          ca: '',
          servername: '',
        },
        sentinelOptions: {
          masterName: 'mymaster',
          nodePassword: '',
        },
      },
      connectionEmpty: {},
      activeTab: 'general',
      sshOptionsShow: false,
      sslOptionsShow: false,
      sentinelOptionsShow: false,
    };
  },
  components: { FileInput, InputPassword, MarkColorSelect, GroupSelect },
  props: {
    config: {
      default: _ => ({}),
    },
    editMode: {
      default: false,
    },
  },
  computed: {
    dialogTitle() {
      return this.editMode ? this.$t('message.edit_connection')
        : this.$t('message.new_connection');
    },
  },
  watch: {
    dialogVisible(visible) {
      if (!visible) {
        this.finishTest();
      }
    },
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.activeTab = 'general';
      this.resetFields();
    },
    resetFields() {
      this.sshOptionsShow = !!this.config.sshOptions;
      this.sslOptionsShow = !!this.config.sslOptions;
      this.sentinelOptionsShow = !!this.config.sentinelOptions;

      // recovery connection before edit
      this.connection = this.mergeConfig(this.editMode ? this.config : null);
    },
    mergeConfig(config) {
      const result = JSON.parse(JSON.stringify(this.connectionEmpty));
      const override = config || {};

      // add authType to old config
      if (override.sshOptions && !override.sshOptions.authType) {
        override.sshOptions.authType = redisClient.getSSHAuthType(override.sshOptions);
      }

      for (const key in override) {
        const val = override[key];
        // dict, ['sshOptions', 'sslOptions', 'sentinelOptions']
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          result[key] = Object.assign({}, result[key], val);
        } else { // str/int/bool
          result[key] = val;
        }
      }

      return result;
    },
    getConnectionConfig() {
      const config = JSON.parse(JSON.stringify(this.connection));

      !config.host && (config.host = '127.0.0.1');
      !config.port && (config.port = 6379);

      // ssh check
      if (!this.sshOptionsShow) {
        delete config.sshOptions;
      } else if (!config.sshOptions.host) {
        this.$message.error(this.$t('message.field_required', {field: this.$t('message.host')}));
        this.activeTab = 'ssh';
        return false;
      }
      // ssl check
      if (!this.sslOptionsShow) {
        delete config.sslOptions;
      }
      // sentinel check
      if (!this.sentinelOptionsShow) {
        delete config.sentinelOptions;
      } else if (!config.sentinelOptions.masterName) {
        this.$message.error(this.$t('message.field_required',
          {field: this.$t('message.master_group_name')}));
        this.activeTab = 'sentinel';
        return false;
      }

      return config;
    },
    editConnection() {
      const config = this.getConnectionConfig();
      if (!config) {
        return;
      }

      const oldKey = storage.getConnectionKey(this.config);
      storage.editConnectionByKey(config, oldKey);

      this.dialogVisible = false;
      this.$emit('editConnectionFinished', config);
    },
    cleanupTestClient() {
      if (!this.testClient) {
        return;
      }
      try {
        this.testClient.removeAllListeners();
        // Prevent unhandled error after disconnect (TLS etc.)
        this.testClient.on('error', () => {});
        this.testClient.disconnect(false);
      } catch (e) {}
      this.testClient = null;
    },
    // ok: true / false; omit ok for cancel (cleanup only, no toast)
    finishTest(ok, message) {
      if (!this.testing) {
        return;
      }
      this.testing = false;

      clearTimeout(this.testTimer);
      this.cleanupTestClient();

      // except ok == null
      if (ok === true) {
        this.$message.success(this.$t('message.test_connection_success'));
      } else if (ok === false) {
        this.$message.error(message || this.$t('message.test_connection_failed'));
      }
    },
    testConnection() {
      if (this.testing) {
        return;
      }

      const config = this.getConnectionConfig();
      if (!config) {
        return;
      }

      this.testing = true;
      this.testClient = null;

      // show timeout message after N seconds
      this.testTimer = setTimeout(() => {
        this.finishTest(false, this.$t('message.test_connection_timeout'));
      }, 5000);

      const clientPromise = config.sshOptions
        ? redisClient.createSSHConnection(
          config.sshOptions, config.host, config.port, config.auth, config,
        )
        : redisClient.createConnection(
          config.host, config.port, config.auth, config,
        );

      clientPromise.then((client) => {
        this.testClient = client;
        client.options.retryStrategy = () => false;

        // Already finished (timeout/cancel) while creating connection.
        if (!this.testing) {
          return this.cleanupTestClient();
        }

        client.on('error', (e) => {
          this.finishTest(false, e.message);
        });

        client.once('ready', () => {
          client.ping().then(() => {
            this.finishTest(true);
          }).catch((e) => {
            this.finishTest(false, e.message);
          });
        });
      }).catch((e) => {
        this.finishTest(false, e.message);
      });
    },
  },
  beforeDestroy() {
    this.finishTest();
  },
  mounted() {
    // back up the empty connection
    this.connectionEmpty = JSON.parse(JSON.stringify(this.connection));
    delete this.connection.connectionName;
  },
};
</script>

<style type="text/css">
  /* dialog */
  .new-connection-dailog .el-dialog {
    max-width: 900px;
  }
  .new-connection-dailog .connection-tabs {
    min-height: 300px;
  }

  /* tabs */
  .new-connection-dailog .connection-tab-label {
    display: inline-flex;
    align-items: center;
  }
  .new-connection-dailog .tab-configured-mark {
    color: #409eff;
    font-size: 10px;
    line-height: 1;
    margin-left: 4px;
  }
  .new-connection-dailog .tab-enable-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  .new-connection-dailog .tab-enable-label {
    margin-right: 12px;
    color: #606266;
    font-size: 14px;
  }
  .dark-mode .new-connection-dailog .tab-enable-label {
    color: #bdc5ce;
  }
  .new-connection-dailog .tab-conflict-hint {
    margin-left: 12px;
    color: #e6a23c;
    font-size: 12px;
  }
  .new-connection-dailog .tab-faq {
    color: #909399;
    font-size: 13px;
  }

  /* ssh tab */
  .new-connection-dailog .ssh-auth-section {
    margin-top: 4px;
    padding-top: 12px;
    border-top: 1px dashed #dcdfe6;
  }
  .dark-mode .new-connection-dailog .ssh-auth-section {
    border-top-color: #416586;
  }
  .new-connection-dailog .ssh-auth-section .el-form-item {
    margin-bottom: 12px;
  }
  .new-connection-dailog .ssh-auth-type .el-radio {
    margin-right: 24px;
  }
  .new-connection-dailog .ssh-auth-type .el-radio:last-child {
    margin-right: 0;
  }

  /* general tab: host/port */
  .new-connection-dailog .host-port-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .new-connection-dailog .host-port-row .host-input {
    flex: 1;
    min-width: 0;
  }
  .new-connection-dailog .host-port-row .port-input {
    width: 100px;
    flex-shrink: 0;
  }

  /* general tab: readonly + mark color */
  .new-connection-dailog .connection-options-row > .el-form-item {
    margin-bottom: 0;
  }
  .new-connection-dailog .connection-option-divider {
    width: 1px;
    height: 20px;
    margin: 50px 16px 0;
    flex-shrink: 0;
    background: #dcdfe6;
  }
  .dark-mode .new-connection-dailog .connection-option-divider {
    background: #4a5c66;
  }
</style>
