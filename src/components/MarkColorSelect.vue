<template>
  <span class="mark-color-swatches">
    <!-- preset colors -->
    <i
      v-for="color in colors"
      :key="color"
      class="mark-color-dot"
      :class="{ active: value === color }"
      :style="{ background: color }"
      @click="selectColor(color)">
    </i>

    <!-- custom color picker -->
    <span
      class="mark-color-dot mark-color-custom-picker-wrap"
      :class="{ active: isCustomColor }"
      :style="{ background: isCustomColor ? value : '' }"
      :title="$t('message.custom')">
      <el-color-picker
        ref="picker"
        :value="value"
        :show-alpha="false"
        class="mark-color-custom-picker"
        @active-change="onActiveChange">
      </el-color-picker>
      <i class="el-icon-plus mark-color-custom-picker-icon"></i>
    </span>

    <!-- clear color btn -->
    <i
      class="el-icon-close mark-color-clear"
      :title="$t('el.colorpicker.clear')"
      @click="selectColor('')">
    </i>
  </span>
</template>

<script type="text/javascript">
export default {
  props: {
    value: { type: String, default: '' },
    colors: {
      type: Array,
      default: () => ['#F56C6C', '#F5C800', '#409EFF', '#85CE61', '#C6E2FF'],
    },
  },
  computed: {
    isCustomColor() {
      return !!this.value && !this.colors.includes(this.value);
    },
  },
  methods: {
    selectColor(color) {
      this.$emit('input', color || '');
    },
    onActiveChange() {
      const picker = this.$refs.picker;
      const color = picker && picker.color && picker.color.value;

      if (color) {
        this.$emit('input', color);
      }
    },
  },
};
</script>

<style scoped>
  .mark-color-swatches {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    gap: 5px;
  }
  .mark-color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid transparent;
    box-sizing: border-box;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .mark-color-dot:hover {
    transform: scale(1.12);
  }
  .mark-color-dot.active {
    border-color: #303133;
    border-width: 2px;
    box-shadow: 0 0 0 1px #fff inset;
  }
  .dark-mode .mark-color-dot.active {
    border-color: #e4e7ed;
    box-shadow: 0 0 0 1px #1d2b33 inset;
  }
  /* custom picker: dot look + transparent click overlay + plus icon */
  .mark-color-custom-picker-wrap {
    border: 1px solid lightgrey;
    position: relative;
  }
  .mark-color-custom-picker {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: auto;
    line-height: 1;
  }
  .mark-color-custom-picker >>> .el-color-picker__trigger {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 50%;
    background: transparent;
  }
  .mark-color-custom-picker >>> .el-color-picker__color,
  .mark-color-custom-picker >>> .el-color-picker__color-inner,
  .mark-color-custom-picker >>> .el-color-picker__icon,
  .mark-color-custom-picker >>> .el-color-picker__empty {
    display: none;
  }
  .mark-color-custom-picker-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    color: #909399;
    pointer-events: none;
  }
  .mark-color-clear {
    font-size: 14px;
    color: #909399;
    cursor: pointer;
  }
</style>
