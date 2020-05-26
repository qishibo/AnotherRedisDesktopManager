<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :append-to-body='true'>
    <!-- redis connection form -->
    <el-form :label-position="labelPosition" label-width="80px">
      <el-form-item label="Host">
        <el-input v-model="connection.host" autocomplete="off" placeholder="127.0.0.1"></el-input>
      </el-form-item>

      <el-form-item label="Port">
        <el-input v-model="connection.port" autocomplete="off" placeholder="6379"></el-input>
      </el-form-item>

      <el-form-item label="Auth">
        <el-input v-model="connection.auth" type='password' autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="Name">
        <el-input v-model="connection.name" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="">
        <el-checkbox v-model="sshOptionsShow">SSH Tunnel</el-checkbox>
        <el-checkbox v-model="connection.cluster">Cluster</el-checkbox>
        <el-popover trigger="hover">
          <i slot="reference" class="el-icon-question"></i>
          {{ $t('message.cluster_faq') }}
        </el-popover>
      </el-form-item>

      <!-- ssh connection form -->
      <el-form v-if="sshOptionsShow" v-show="sshOptionsShow" label-width="80px">
        <el-form-item label="Host">
          <el-input v-model="connection.sshOptions.host" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Port">
          <el-input v-model="connection.sshOptions.port" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Username">
          <el-input v-model="connection.sshOptions.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="Password">
          <el-input v-model="connection.sshOptions.password" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="PrivateKey">
          <el-tooltip effect="dark">
            <div slot="content" v-html="$t('message.private_key_faq')"></div>
            <el-input v-if='connection.sshOptions.privatekey' v-model='connection.sshOptions.privatekey' clearable autocomplete="off" ></el-input>
            <el-input v-else id='private-key-path' type='file' @change='changePrivateKey'></el-input>
          </el-tooltip>
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
        cluster: false,
        sshOptions: {
          host: '',
          port: 22,
          username: '',
          password: '',
          privatekey: '',
        }
      },
      sshOptionsShow: false,
    }
  },
  props: ['config', 'editMode'],
  computed: {
    dialogTitle() {
      return this.editMode ? this.$t('message.edit_connection') :
                              this.$t('message.new_connection')
    },
  },
  methods: {
    editConnection() {
      const config = JSON.parse(JSON.stringify(this.connection));

      !config.host && (config.host = '127.0.0.1');
      !config.port && (config.port = 6379);

      if (!this.sshOptionsShow || !config.sshOptions.host) {
        delete config.sshOptions;
      }

      storage.editConnectionByKey(config, this.oldKey);

      this.dialogVisible = false;
      this.$emit('editConnectionFinished');
    },
    changePrivateKey() {
      const path = document.getElementById('private-key-path').files[0].path;
      this.$set(this.connection.sshOptions, 'privatekey', path);
    }
  },
  mounted() {
    if (this.editMode) {
      const sshOptionsNew = this.connection.sshOptions;
      this.connection = JSON.parse(JSON.stringify(this.config));
      this.oldKey = storage.getConnectionKey(this.config);

      this.sshOptionsShow = !!this.connection.sshOptions;
      !this.connection.sshOptions && (this.connection.sshOptions = sshOptionsNew);
    }

    delete this.connection.connectionName;
  },
}
</script>
