<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :append-to-body='true' :close-on-click-modal='false' class='new-connection-dailog' width='90%'>
    <!-- redis connection form -->
    <el-form :label-position="labelPosition" label-width="90px">
      <el-row :gutter=20>
        <!-- left col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.host')" required>
            <el-input v-model="connection.host" autocomplete="off" placeholder="127.0.0.1"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.password')">
            <InputPassword v-model="connection.auth" :hidepass="editMode" placeholder="Auth"></InputPassword>
          </el-form-item>

          <el-form-item :label="$t('message.connection_name')">
            <el-input v-model="connection.name" autocomplete="off"></el-input>
          </el-form-item>

          <!-- connection group -->
          <el-form-item :label="$t('message.group')">
            <div class="group-select-wrap">
              <el-select
                v-model="connection.groupId"
                clearable
                filterable
                class="group-select"
                :placeholder="$t('message.select_group')">
                <el-option
                  v-for="group in groups"
                  :key="group.id"
                  :label="group.name"
                  :value="group.id">
                </el-option>
              </el-select>
              <i
                class="el-icon-plus group-add-icon"
                :title="$t('message.new_group')"
                @click.stop="openNewGroupDialog">
              </i>
            </div>
          </el-form-item>
        </el-col>

        <!-- right col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.port')" required>
            <el-input type='number' v-model="connection.port" autocomplete="off" placeholder="6379"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.username')">
            <el-input v-model="connection.username" placeholder='ACL in Redis >= 6.0' autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.separator')">
            <el-tooltip effect="dark">
              <div slot="content">{{ $t('message.separator_tip') }}</div>
              <el-input v-model="connection.separator" autocomplete="off" placeholder='Empty To Disable Tree View'></el-input>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- other operation -->
      <el-form-item label="">
        <el-checkbox v-model="sshOptionsShow">SSH</el-checkbox>
        <el-checkbox v-model="sslOptionsShow">TLS/SSL</el-checkbox>
        <el-checkbox v-model="sentinelOptionsShow">
          Sentinel
          <el-popover trigger="hover">
            <i slot="reference" class="el-icon-question"></i>
            {{ $t('message.sentinel_faq') }}
          </el-popover>
        </el-checkbox>
        <el-checkbox v-model="connection.cluster">
          Cluster
          <el-popover trigger="hover">
            <i slot="reference" class="el-icon-question"></i>
            {{ $t('message.cluster_faq') }}
          </el-popover>
        </el-checkbox>
        <el-checkbox v-model="connection.connectionReadOnly">
          Readonly
          <el-popover trigger="hover">
            <i slot="reference" class="el-icon-question"></i>
            {{ $t('message.connection_readonly') }}
          </el-popover>
        </el-checkbox>
      </el-form-item>
    </el-form>

    <!-- ssh connection form -->
    <el-form v-if="sshOptionsShow" v-show="sshOptionsShow" label-position='top' label-width="90px">
      <fieldset>
        <legend>SSH Tunnel</legend>
      </fieldset>

      <el-row :gutter=20>
        <!-- left col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.host')" required>
            <el-input v-model="connection.sshOptions.host" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.username')" required>
            <el-input v-model="connection.sshOptions.username" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.private_key')">
            <FileInput
              :file.sync='connection.sshOptions.privatekey'
              :bookmark.sync='connection.sshOptions.privatekeybookmark'
              placeholder='SSH Private Key'>
            </FileInput>
          </el-form-item>

          <el-form-item label="Passphrase">
            <InputPassword v-model="connection.sshOptions.passphrase" placeholder='Passphrase for Private Key'></InputPassword>
          </el-form-item>
        </el-col>

        <!-- right col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.port')" required>
            <el-input type='number' v-model="connection.sshOptions.port" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item :label="$t('message.password')">
            <InputPassword v-model="connection.sshOptions.password" placeholder="SSH Password"></InputPassword>
          </el-form-item>

          <el-form-item :label="$t('message.timeout')">
            <el-input type='number' v-model="connection.sshOptions.timeout" autocomplete="off" placeholder='SSH Timeout (Seconds)'></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- SSL connection form -->
    <el-form v-if="sslOptionsShow" v-show="sslOptionsShow" label-position='top' label-width="90px">
      <fieldset>
        <legend>TLS/SSL</legend>
      </fieldset>

      <el-row :gutter=20>
        <!-- left col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.private_key')">
            <FileInput
              :file.sync='connection.sslOptions.key'
              :bookmark.sync='connection.sslOptions.keybookmark'
              placeholder='SSL Private Key Pem (key)'>
              </FileInput>
          </el-form-item>

          <el-form-item :label="$t('message.authority')">
            <FileInput
              :file.sync='connection.sslOptions.ca'
              :bookmark.sync='connection.sslOptions.cabookmark'
              placeholder='SSL Certificate Authority (CA)'>
              </FileInput>
          </el-form-item>
        </el-col>

        <!-- right col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.public_key')">
            <FileInput
              :file.sync='connection.sslOptions.cert'
              :bookmark.sync='connection.sslOptions.certbookmark'
              placeholder='SSL Public Key Pem (cert)'>
              </FileInput>
          </el-form-item>

          <!-- SNI -->
          <el-form-item label="SNI">
            <el-input v-model="connection.sslOptions.servername" autocomplete="off" placeholder='SNI Servername'></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- Sentinel connection form -->
    <el-form v-if="sentinelOptionsShow" v-show="sentinelOptionsShow" label-position='top' label-width="90px">
      <fieldset>
        <legend>Sentinel</legend>
      </fieldset>

      <el-row :gutter=20>
        <!-- left col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.redis_node_password')">
            <InputPassword v-model="connection.sentinelOptions.nodePassword" placeholder='Redis Node Password'></InputPassword>
          </el-form-item>
        </el-col>

        <!-- right col -->
        <el-col :span=12>
          <el-form-item :label="$t('message.master_group_name')" required>
            <el-input v-model="connection.sentinelOptions.masterName" autocomplete="off" placeholder='Master Group Name'></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="editConnection">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>

    <!-- new group dialog -->
    <el-dialog
      :title="$t('message.new_group')"
      :visible.sync="showGroupDialog"
      width="400px"
      append-to-body>
      <el-form @submit.native.prevent="handleNewGroup">
        <el-form-item :label="$t('message.group_name')">
          <el-input
            v-model="newGroupName"
            :placeholder="$t('message.group_name')">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showGroupDialog = false">{{ $t('message.close') }}</el-button>
        <el-button type="primary" @click="handleNewGroup">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage';
import FileInput from '@/components/FileInput';
import InputPassword from '@/components/InputPassword';

export default {
  data() {
    return {
      groups: [],
      dialogVisible: false,
      labelPosition: 'top',
      oldKey: '',
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
        sshOptions: {
          host: '',
          port: 22,
          username: '',
          password: '',
          privatekey: '',
          passphrase: '',
          timeout: 30,
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
      sshOptionsShow: false,
      sslOptionsShow: false,
      sentinelOptionsShow: false,
      showGroupDialog: false,
      newGroupName: '',
    };
  },
  components: { FileInput, InputPassword },
  props: {
    config: {
      default: _ => new Array(),
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
  methods: {
    loadGroups() {
      this.groups = storage.getGroups();
    },
    openNewGroupDialog() {
      this.newGroupName = '';
      this.showGroupDialog = true;
    },
    handleNewGroup() {
      const name = this.newGroupName.trim();

      if (!name) {
        return this.$message.error(this.$t('message.group_name_required'));
      }

      const group = storage.addGroup(name);

      if (!group) {
        return this.$message.error(this.$t('message.group_exists'));
      }

      this.loadGroups();
      this.connection.groupId = group.id;

      this.showGroupDialog = false;
      this.$message.success(this.$t('message.add_success'));
      this.$bus.$emit('groups-updated');
    },
    show() {
      this.dialogVisible = true;
      this.resetFields();
      this.loadGroups();
    },
    resetFields() {
      // edit connection mode
      if (this.editMode) {
        this.sshOptionsShow = !!this.config.sshOptions;
        this.sslOptionsShow = !!this.config.sslOptions;
        this.sentinelOptionsShow = !!this.config.sentinelOptions;
        // recovery connection before edit
        const connection = Object.assign({}, this.connectionEmpty, this.config);
        this.connection = JSON.parse(JSON.stringify(connection));
      }
      // new connection mode
      else {
        this.sshOptionsShow = false;
        this.sslOptionsShow = false;
        this.sentinelOptionsShow = false;
        this.connection = JSON.parse(JSON.stringify(this.connectionEmpty));
      }
    },
    editConnection() {
      const config = JSON.parse(JSON.stringify(this.connection));

      if (this.sentinelOptionsShow && config.cluster) {
        return this.$message.error('Sentinel & Cluster cannot be checked together!');
      }

      !config.host && (config.host = '127.0.0.1');
      !config.port && (config.port = 6379);

      if (!this.sshOptionsShow || !config.sshOptions.host) {
        delete config.sshOptions;
      }

      if (!this.sslOptionsShow) {
        delete config.sslOptions;
      }

      if (!this.sentinelOptionsShow || !config.sentinelOptions.masterName) {
        delete config.sentinelOptions;
      }

      const oldKey = storage.getConnectionKey(this.config);
      storage.editConnectionByKey(config, oldKey);

      this.dialogVisible = false;
      this.$emit('editConnectionFinished', config);
    },
  },
  mounted() {
    // back up the empty connection
    this.connectionEmpty = JSON.parse(JSON.stringify(this.connection));

    // edit mode
    if (this.editMode) {
      this.sslOptionsShow = !!this.config.sslOptions;
      this.sshOptionsShow = !!this.config.sshOptions;
      this.sentinelOptionsShow = !!this.config.sentinelOptions;

      this.connection = Object.assign({}, this.connection, this.config);
    }

    delete this.connection.connectionName;
  },
};
</script>

<style type="text/css">
  .new-connection-dailog .el-checkbox {
    margin-left: 0;
    margin-right: 15px;
  }

  .new-connection-dailog .el-dialog {
    max-width: 900px;
  }

  .new-connection-dailog fieldset {
    border-width: 2px 0 0 0;
    border-color: #fff;
    font-weight: bold;
    color: #bdc5ce;
    font-size: 105%;
    margin-bottom: 3px;
  }
  .dark-mode .new-connection-dailog fieldset {
    color: #416586;
    border-color: #7b95ad;
  }

  /*  group select*/
  .new-connection-dailog .group-select-wrap {
    position: relative;
  }
  .new-connection-dailog .group-select {
    width: 100%;
  }
  .new-connection-dailog .group-select .el-input__inner {
    padding-right: 50px;
  }
  .new-connection-dailog .group-add-icon {
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    cursor: pointer;
  }
  .new-connection-dailog .group-add-icon:hover {
    color: #409eff;
  }
</style>
