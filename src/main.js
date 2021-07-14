import Vue from 'vue';
import ElementUI from 'element-ui';
import 'font-awesome/css/font-awesome.css';
import App from './App';
import i18n from './i18n/i18n';
import bus from './bus';
import util from './util';
import storage from './storage';
import shortcut from './shortcut';


Vue.prototype.$bus = bus;
Vue.prototype.$util = util;
Vue.prototype.$storage = storage;
Vue.prototype.$shortcut = shortcut;

Vue.use(ElementUI, { size: 'small' });
Vue.config.productionTip = false;

/* eslint-disable no-new */
var vue = new Vue({
  el: '#app',
  i18n,
  components: { App },
  template: '<App/>',
});

// handle uncaught exception
process.on('uncaughtException', (err, origin) => {
  if (!err) {
    return;
  }

  vue.$message.error({
    message: 'Uncaught Exception: ' + err,
    duration: 5000,
  });

  vue.$bus.$emit('closeConnection');
});

export default vue;
