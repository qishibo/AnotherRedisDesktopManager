<template>
  <div>
    <!-- setting button -->
    <el-button type="primary" icon="el-icon-setting" @click="settingDialog.visible = true" plain></el-button>

    <!-- setting dialog -->
    <Setting :settingDialog="settingDialog"></Setting>

    <!-- cli button -->
    <el-tooltip effect="dark" :content="$t('message.redis_console')" placement="bottom">
      <el-button type="primary" @click="cliDialog.visible = true" plain><i class="fa fa-terminal"></i></el-button>
    </el-tooltip>

    <!-- cli dialog -->
    <CliConsole :cliDialog="cliDialog"></CliConsole>

    <!-- language select -->
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
import CliConsole from '@/components/CliConsole';
import Setting from '@/components/Setting';

export default {
  data() {
    return {
      selectedLang: 'en',
      langItems: [
        { value: 'en', label: 'English' },
        { value: 'cn', label: '简体中文' },
      ],
      cliDialog: { visible: false },
      settingDialog: { visible: false },
    };
  },
  components: { CliConsole, Setting },
  methods: {
    changeLang(lang) {
      localStorage.lang = this.selectedLang;
      this.$i18n.locale = this.selectedLang;
    },
  },
  mounted() {
    this.selectedLang = localStorage.lang || this.selectedLang;
  },
};
</script>
