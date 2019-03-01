import Vue from 'vue';

const eventHub = new Vue();

export default {
  $on(...event) {
    eventHub.$on(...event);
  },
  $off(...event) {
    eventHub.$off(...event);
  },
  $once(...event) {
    eventHub.$once(...event);
  },
  $emit(...event) {
    eventHub.$emit(...event);
  },
};
