<template>
  <div>
    <div>

      <!-- new connection button -->
      <el-button type="info" @click="dialogFormVisible = true" icon="el-icon-plus">{{ $t('message.new_connection') }}</el-button>

      <!-- new connection dialog -->
      <el-dialog :title="$t('message.new_connection')" :visible.sync="dialogFormVisible">
        <el-form v-model="newConnection" :label-position="labelPosition" label-width="80px">
          <el-form-item label="Host">
            <el-input v-model="newConnection.host" autocomplete="off" placeholder="127.0.0.1"></el-input>
          </el-form-item>

          <el-form-item label="Port">
            <el-input v-model="newConnection.port" autocomplete="off" placeholder="6379"></el-input>
          </el-form-item>

          <el-form-item label="Auth">
            <el-input v-model="newConnection.auth" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Alias Name">
            <el-input v-model="newConnection.name" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addNewConnection">确 定</el-button>
        </div>
      </el-dialog>

    </div>

    <!-- connection list -->
    <div class="connections-list">
      <Connections ref="connections"></Connections>
    </div>

  </div>
</template>

<script>
import Connections from '@/components/Connections';
import storage from './storage';

export default {
  data() {
    return {
      dialogFormVisible: false,
      labelPosition: 'top',
      newConnection: {
        host: '',
        port: '',
        auth: '',
        name: '',
      },
    };
  },
  components: { Connections },
  methods: {
    addNewConnection() {
      const connection = this.newConnection;

      !connection.host && (connection.host = '127.0.0.1');
      !connection.port && (connection.port = 6379);

      if (storage.addConnection(connection) === false) {
        this.$message.error({
          message: this.$t('message.connection_exists'),
          duration: 2000,
        });

        return;
      }

      this.dialogFormVisible = false;
      this.$refs.connections.initConnections();
    },
  },
};
</script>
