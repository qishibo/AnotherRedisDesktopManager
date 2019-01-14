<template>
  <div>
    <el-button type="primary" icon="el-icon-setting" @click="dialogFormVisible = true"></el-button>

    <el-dialog title="基础设置" :visible.sync="dialogFormVisible">
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
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSettings">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>
export default {
  name: 'Header',

  data() {
    return {
      form: {
        name: '',
        region: ''
      },
      dialogFormVisible: false
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
      console.log('gettint settings from storage');
      return localStorage.getItem('settings');
    },
    saveSettings() {
      let settings = JSON.stringify(this.form);
      console.log(settings);

      localStorage.setItem('settings', settings);

      this.dialogFormVisible = false;
    }
  },
  mounted() {
    this.showSettings();
  }
}
</script>
