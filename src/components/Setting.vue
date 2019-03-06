<template>
  <!-- setting dialog -->
  <el-dialog :title="$t('message.settings')" :visible.sync="settingDialog.visible">
    <el-form>

      <el-form-item label="Name" >
        <el-input v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Area" >
        <el-select v-model="form.area" placeholder="Select Area">
          <el-option label="NewYork" value="NewYork"></el-option>
          <el-option label="ShangHai" value="ShangHai"></el-option>
          <el-option label="BeiJing" value="BeiJing"></el-option>
        </el-select>
      </el-form-item>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="settingDialog.visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="saveSettings">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script type="text/javascript">
import storage from '@/storage.js';

export default {
  data() {
    return {
      form: {
        name: '',
        area: '',
      },
    };
  },
  props: ['settingDialog'],
  methods: {
    showSettings() {
      let settings = this.getSettings();

      if (!settings) {
        return;
      }

      settings = JSON.parse(settings);

      this.form = settings;
    },
    getSettings() {
      return localStorage.getItem('settings');
    },
    saveSettings() {
      const settings = JSON.stringify(this.form);
      console.log('saving settings...', settings);

      localStorage.setItem('settings', settings);

      this.settingDialog.visible = false;
    },
  },
  mounted() {
    this.showSettings();
  },
};
</script>
