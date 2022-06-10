<template>
  <el-input :value="value" @input="handleInput" :type="inputType" :placeholder="placeholder">
    <i ref="toggler" slot="suffix" class="toggler el-icon-view" @click="togglePassword"></i>
  </el-input>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      inputType: 'password',
      hideTextTime: 6000,
    }
  },
  props: ['value', 'placeholder'],
  methods: {
    handleInput(newValue) {
      this.$emit('input', newValue);
    },
    togglePassword() {
      clearTimeout(this.recoverTimer);

      if (!this.$refs.toggler) {
        return;
      }

      // show text
      if (this.inputType == 'password') {
        this.inputType = 'text';
        this.$refs.toggler.classList.add('toggler-text');

        // set time to hide text
        this.recoverTimer = setTimeout(() => {
          this.togglePassword();
        }, this.hideTextTime);
      }

      // back to password
      else {
        this.inputType = 'password';
        this.$refs.toggler.classList.remove('toggler-text');
      }
    },
  },
  destroyed() {
    clearTimeout(this.recoverTimer);
  },
}
</script>

<style type="text/css" scoped>
  .toggler {
    cursor: pointer;
    font-weight: bold;
    margin-right: 4px;
  }
  .toggler:hover {
    color: #6895ee;
  }
  .toggler.toggler-text {
    color: #6895ee;
  }
</style>
