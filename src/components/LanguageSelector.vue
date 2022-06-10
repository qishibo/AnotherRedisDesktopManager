<template>
  <!-- language select -->
  <el-select v-model="selectedLang" @change="changeLang" placeholder="Language">
    <el-option
      v-for="item in langItems"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script type="text/javascript">
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
        { value: 'fr', label: 'Français' },
        { value: 'ua', label: 'Українською' },
        { value: 'it', label: 'Italiano' },
		{ value: 'es', label: 'Español' }
      ],
    };
  },
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
