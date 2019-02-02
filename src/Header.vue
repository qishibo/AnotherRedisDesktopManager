<template>
  <div>
    <el-button type="primary" icon="el-icon-setting" @click="dialogFormVisible = true"></el-button>

    <el-dialog :title="$t('message.settings')" :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="连接名称" >
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="连接区域" >
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="saveSettings">{{ $t('el.messagebox.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-select v-model="selectedLang" @change="changeLang" placeholder="Language">
        <el-option
          v-for="item in langItems"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

  </div>
</template>


<script>
export default {
  data() {
    return {
      form: {
        name: '',
        region: ''
      },
      dialogFormVisible: false,
      selectedLang: 'en',
      langItems: [
        {value: 'en', label: 'English'},
        {value: 'cn', label: '简体中文'},
      ],
    }
  },
  methods: {
    showSettings: function () {
      let settings = this.getSettings();

      if (!settings) {
        return;
      }

      settings = JSON.parse(settings);

      this.form = settings;
    },
    getSettings () {
      return localStorage.getItem('settings');
    },
    saveSettings() {
      let settings = JSON.stringify(this.form);
      console.log('saving settings...', settings);

      localStorage.setItem('settings', settings);

      this.dialogFormVisible = false;
    },
    changeLang(lang) {
      localStorage.lang = this.selectedLang;
      this.$i18n.locale = this.selectedLang;
    }
  },
  mounted() {
    this.selectedLang = localStorage.lang || this.selectedLang;
    this.showSettings();
  }
};
</script>
