<template>
  <el-dialog :title="$t('message.custom_formatter')" :visible.sync="visible" append-to-body width='60%'>
    <!-- new formatter btn -->
    <el-button size="mini" @click="addDialog=true">+ {{ $t('message.new') }}</el-button>
    <!-- formatter list -->
    <el-table :data='formatters'>
      <el-table-column
        label="Name"
        prop="name"
        width="120">
      </el-table-column>
      <el-table-column
        label="Formatter">
        <template slot-scope="scope">
          {{ formatterPreview(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="Operation"
        width="90">
        <template slot-scope="scope">
          <el-button icon="el-icon-delete" type="text" @click="removeFormatter(scope.$index)"></el-button>
          <el-button icon="el-icon-edit-outline" type="text" @click="showEditDialog(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- new formatter dialog -->
    <el-dialog :close-on-click-modal='false' :title="!editMode ? $t('message.new') : $t('message.edit')"
               :visible.sync="addDialog" append-to-body
               @closed='reset'>
      <el-form label-position="top" size="mini">
        <el-form-item label="Name" required>
          <el-input v-model='formatter.name'></el-input>
        </el-form-item>

        <el-form-item label="Command" required>
          <span slot="label">
            Command
            <el-popover
              placement="top-start"
              title="Command"
              trigger="hover">
              <i slot="reference" class="el-icon-question"></i>
              <p>Executable file, such as  <el-tag>/bin/bash</el-tag>, <el-tag>/bin/node</el-tag>, <el-tag>xxx.sh</el-tag>, <el-tag>xxx.php</el-tag>, make sure it is executable</p>
            </el-popover>
          </span>
          <FileInput
            :file.sync='formatter.command'
            placeholder='/bin/bash'>
          </FileInput>
        </el-form-item>

        <el-form-item label="Params">
          <span slot="label">
            Params
            <el-popover
              placement="top-start"
              title="Params"
              trigger="hover">
              <i slot="reference" class="el-icon-question"></i>
              <p>
                Command params, such as "--key
                <el-tag>{KEY}</el-tag> --value <el-tag>{VALUE}</el-tag>"<hr>
                <b>Template variables to be replaced:</b>
                <table>
                  <tr>
                    <td>[String]</td>
                    <td><el-tag>{VALUE}</el-tag></td>
                  </tr>
                  <tr>
                    <td>[Hash]</td>
                    <td><el-tag>{FIELD}</el-tag> <el-tag>{VALUE}</el-tag></td>
                  </tr>
                  <tr>
                    <td>[List]</td>
                    <td><el-tag>{VALUE}</el-tag></td>
                  </tr>
                  <tr>
                    <td>[Set]</td>
                    <td><el-tag>{VALUE}</el-tag></td>
                  </tr>
                  <tr>
                    <td>[Zset]</td>
                    <td><el-tag>{SCORE}</el-tag> <el-tag>{MEMBER}</el-tag></td>
                  </tr>
                </table>
                <hr>
                If your value is unvisible, you can pass <el-tag>{HEX}</el-tag> instead of <el-tag>{VALUE}</el-tag><br>
                then hex such as <i>68656c6c6f20776f726c64</i> will be passed
              </p>
            </el-popover>
          </span>
          <el-input v-model='formatter.params' placeholder='--value "{VALUE}"'></el-input>
        </el-form-item>

        <el-form-item label="">
          <p>{{ formatterPreview(formatter) }}</p>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog=false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="editFormatter">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage';
import FileInput from '@/components/FileInput';

export default {
  data() {
    return {
      visible: false,
      addDialog: false,
      editMode: false,
      formatter: { name: '', command: '', params: '' },
    };
  },
  components: { FileInput },
  computed: {
    formatters() {
      return storage.getCustomFormatter();
    },
  },
  created() {
    this.$bus.$on('addCustomFormatter', () => {
      this.show();
    });
  },
  methods: {
    show() {
      this.visible = true;
    },
    reset() {
      this.editMode = false;
      this.formatter = { name: '', command: '', params: '' };
    },
    formatterPreview(row) {
      return `${row.command} ${row.params}`;
    },
    showEditDialog(row) {
      this.formatter = row;
      this.addDialog = true;
      this.editMode = true;
    },
    editFormatter() {
      if (!this.formatter.name || !this.formatter.command) {
        return false;
      }

      // add mode
      if (!this.editMode) {
        this.formatters.push(this.formatter);
      }

      this.saveSetting();
      this.addDialog = false;
    },
    removeFormatter(index) {
      this.formatters.splice(index, 1);
      this.saveSetting();
    },
    saveSetting() {
      storage.saveCustomFormatters(this.formatters);
      this.$bus.$emit('refreshViewers');
    },
  },
};
</script>
