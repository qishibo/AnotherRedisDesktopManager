// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.css';
import App from './App';
// import router from './router';

import i18n from './i18n/i18n';
import BUS from './bus';

import util from './util';

BUS(Vue);
Vue.prototype.util = util;


Vue.use(ElementUI, {size: "small"});

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // router,
  i18n,
  components: { App },
  template: '<App/>'
})


// locale lang https://segmentfault.com/a/1190000015360639
// ali DMS https://help.aliyun.com/document_detail/47680.html?spm=a2c4g.11186623.6.646.7791a3ddpdzgR8
