import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.css';
import App from './App';

import i18n from './i18n/i18n';
import bus from './bus';
import util from './util';

Vue.prototype.$bus = bus;
Vue.prototype.$util = util;

Vue.use(ElementUI, {size: "small"});
Vue.config.productionTip = false;

new Vue({
  el: '#app',
  i18n,
  components: { App },
  template: '<App/>'
});
