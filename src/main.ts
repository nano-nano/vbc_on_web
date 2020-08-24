import Vue from 'vue'
import App from './App.vue'
import router from './router'

import VueCompositionApi from "@vue/composition-api";
Vue.use(VueCompositionApi);

import "bootstrap-honoka/dist/css/bootstrap.min.css";
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
