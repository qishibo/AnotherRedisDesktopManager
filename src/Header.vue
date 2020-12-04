<template>
  <div>
    <!-- setting button -->
    <el-button type="primary" icon="el-icon-setting" @click="settingDialog.visible = true" plain></el-button>

    <!-- setting dialog -->
    <Setting :settingDialog="settingDialog"></Setting>

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

<script type="text/javascript">
import Setting from '@/components/Setting';

export default {
  data() {
    return {
      selectedLang: 'en',
      langItems: [
        { value: 'en', label: 'English' },
        { value: 'cn', label: '简体中文' },
        { value: 'tw', label: '繁體中文' },
        { value: 'tr', label: 'Türkçe' },
        { value: 'ru', label: 'Русский' },
        { value: 'pt', label: 'Português' },
        { value: 'de', label: 'Deutsch' },
        { value: 'fr', label: 'Français' }
      ],
      settingDialog: { visible: false },
    };
  },
  components: { Setting },
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
