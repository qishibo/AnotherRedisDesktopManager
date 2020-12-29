<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :append-to-body='true' :close-on-click-modal='false' class='new-connection-dailog'>
    <!-- redis connection form -->
    <el-form :label-position="labelPosition" label-width="90px">
      <el-form-item label="Host">
        <el-input v-model="connection.host" autocomplete="off" placeholder="127.0.0.1"></el-input>
      </el-form-item>

      <el-form-item label="Port">
        <el-input type='number' v-model="connection.port" autocomplete="off" placeholder="6379"></el-input>
      </el-form-item>

      <el-form-item label="Auth">
        <el-input v-model="connection.auth" type='password' autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="Name">
        <el-input v-model="connection.name" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="Separator">
        <el-input v-model="connection.separator" autocomplete="off" placeholder='Empty To Disable Tree View'></el-input>
      </el-form-item>

      <el-form-item label="">
        <el-checkbox v-model="sshOptionsShow">SSH Tunnel</el-checkbox>
        <el-checkbox v-model="sslOptionsShow">SSL</el-checkbox>
        <!-- <el-checkbox v-model="connection.sentinel">Sentinel</el-checkbox> -->
        <el-checkbox v-model="connection.cluster">
          Cluster
          <el-popover trigger="hover">
            <i slot="reference" class="el-icon-question"></i>
            {{ $t('message.cluster_faq') }}
          </el-popover>
        </el-checkbox>

      </el-form-item>

      <!-- ssh connection form -->
      <el-form v-if="sshOptionsShow" v-show="sshOptionsShow" label-width="90px">
        <fieldset>
          <legend>SSH Tunnel</legend>
        </fieldset>

        <el-form-item label="Host">
          <el-input v-model="connection.sshOptions.host" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Port">
          <el-input type='number' v-model="connection.sshOptions.port" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Username">
          <el-input v-model="connection.sshOptions.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Password">
          <el-input v-model="connection.sshOptions.password" type='password' autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="PrivateKey">
          <el-tooltip effect="dark">
            <div slot="content" v-html="$t('message.private_key_faq')"></div>
            <FileInput :file.sync='connection.sshOptions.privatekey' placeholder='SSH Private Key'></FileInput>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="Passphrase">
          <el-input v-model="connection.sshOptions.passphrase" type='password' autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Timeout">
          <el-input type='number' v-model="connection.sshOptions.timeout" autocomplete="off" placeholder='SSH Timeout (Seconds)'></el-input>
        </el-form-item>
      </el-form>

      <!-- SSL connection form -->
      <el-form v-if="sslOptionsShow" v-show="sslOptionsShow" label-width="90px">
        <fieldset>
          <legend>SSL</legend>
        </fieldset>

        <el-form-item label="PrivateKey">
          <FileInput :file.sync='connection.sslOptions.key' placeholder='SSL Private Key Pem (key)'></FileInput>
        </el-form-item>

        <el-form-item label="PublicKey">
          <FileInput :file.sync='connection.sslOptions.cert' placeholder='SSL Public Key Pem (cert)'></FileInput>
        </el-form-item>

        <el-form-item label="Authority">
          <FileInput :file.sync='connection.sslOptions.ca' placeholder='SSL Certificate Authority (CA)'></FileInput>
        </el-form-item>
      </el-form>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="editConnection">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage';
import FileInput from '@/components/FileInput';

export default {
  data() {
    return {
      dialogVisible: false,
      labelPosition: 'left',
      oldKey: '',
      connection: {
        host: '',
        port: '',
        auth: '',
        name: '',
        separator: ':',
        cluster: false,
        // sentinel: false,
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
        }
      },
      connectionRaw: {},
      connectionEmpty: {},
      sshOptionsShow: false,
      sslOptionsShow: false,
    }
  },
  components: {FileInput},
  props: ['config', 'editMode'],
  computed: {
    dialogTitle() {
      return this.editMode ? this.$t('message.edit_connection') :
                              this.$t('message.new_connection')
    },
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.resetFields();
    },
    resetFields() {
      // edit connection mode
      if (this.editMode) {
        this.sshOptionsShow = !!this.connectionRaw.sshOptions
        this.sslOptionsShow = !!this.connectionRaw.sslOptions
        // recovery connection before edit
        let connection = Object.assign({}, this.connectionEmpty, this.connectionRaw);
        this.connection = JSON.parse(JSON.stringify(connection));
      }
      // new connection mode
      else {
        this.sshOptionsShow = false;
        this.sslOptionsShow = false;
        this.connection = JSON.parse(JSON.stringify(this.connectionEmpty));
      }
    },
    editConnection() {
      const config = JSON.parse(JSON.stringify(this.connection));

      !config.host && (config.host = '127.0.0.1');
      !config.port && (config.port = 6379);

      if (!this.sshOptionsShow || !config.sshOptions.host) {
        delete config.sshOptions;
      }

      if (!this.sslOptionsShow) {
        delete config.sslOptions;
      }

      // config as new connectionRaw
      this.connectionRaw = config;
      storage.editConnectionByKey(config, this.oldKey);

      this.dialogVisible = false;
      this.$emit('editConnectionFinished');
    },
  },
  mounted() {
    // back up the empty connection
    this.connectionEmpty = JSON.parse(JSON.stringify(this.connection));

    // edit mode
    if (this.editMode) {
      // back up the raw connection for edit mode
      this.connectionRaw = JSON.parse(JSON.stringify(this.config));

      this.oldKey = storage.getConnectionKey(this.config);
      this.sslOptionsShow = !!this.config.sslOptions;
      this.sshOptionsShow = !!this.config.sshOptions;

      this.connection = Object.assign({}, this.connection, this.config);
    }

    delete this.connection.connectionName;
  },
}
</script>

<style type="text/css" scoped>
  .new-connection-dailog .el-checkbox {
    margin-left: 0;
    margin-right: 15px;
  }

  fieldset {
    border-width: 2px 0 0 0;
    border-color: #fff;
    font-weight: bold;
    color: #bdc5ce;
    font-size: 105%;
    margin-bottom: 3px;
  }
  .dark-mode fieldset {
    color: #416586;
    border-color: #7b95ad;
  }
</style>
