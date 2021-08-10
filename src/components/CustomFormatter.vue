<template>
  <el-dialog :title="$t('message.custom_formatter')" :visible.sync="visible" custom-class='hotkey-tips-dialog'
             append-to-body>
    <el-button size="mini" @click="addShow">+ {{ $t('message.new') }}</el-button>
    <el-table :data='formatters'>
      <el-table-column
        prop="name"
        width="180"
        label="Name">
      </el-table-column>
      <el-table-column
        prop="formatter"
        label="Formatter">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Operation"
        width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="removeFormatter(scope.$index)">{{ $t('message.delete') }}</el-button>
          <el-button type="text" size="small" @click="editFormatter(scope.$index,scope.row)"> {{ $t('message.edit') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="addVisible" width="400px"
               :title="index === -1 ? $t('message.custom_add_formatter') : $t('message.custom_edit_formatter')" append-to-body>
      <el-form label-position="top" size="mini">
        <el-form-item label="Name">
          <el-input v-model='formatter.name'>
          </el-input>
        </el-form-item>
        <el-form-item label="Formatter">
          <FileInput
            :file.sync='formatter.formatter'
            :bookmark.sync='formatter.formatter'
            placeholder='Formatter'>
          </FileInput>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reset">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="addFormatter()">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import FileInput from '@/components/FileInput';

export default {
  components: { FileInput },
  data() {
    return {
      visible: false,
      addVisible: false,
      index: -1,
      formatter: { name: '', formatter: '' },
    };
  },
  created() {
    this.$bus.$on('openCustomFormatDialog', () => {
      this.show();
    });
  },
  computed: {
    formatters() {
      const settings = storage.getSetting();
      if (settings.formatters === undefined || settings.formatters === null) {
        settings.formatters = [];
      }
      return settings.formatters;
    },
  },
  methods: {
    show() {
      this.visible = true;
    },
    reset() {
      this.index = -1;
      this.addVisible = false;
      this.formatter = { name: '', formatter: '' };
    },
    addShow() {
      this.addVisible = true;
    },
    addFormatter() {
      if (this.index === -1) {
        this.formatters.push(this.formatter);
      } else {
        this.formatters[this.index].name = this.formatter.name;
        this.formatters[this.index].formatter = this.formatter.formatter;
      }
      this.saveSetting();
      this.reset();
    },
    removeFormatter(i) {
      this.formatters.splice(this.formatters.indexOf(i), 1);
      this.saveSetting();
    },
    editFormatter(i, row) {
      this.formatter.name = row.name;
      this.formatter.formatter = row.formatter;
      this.addVisible = true;
      this.index = i;
    },
    saveSetting() {
      const settings = storage.getSetting();
      settings.formatters = this.formatters;
      this.$bus.$emit('saveSettings', settings);
    },
  },
};
</script>
