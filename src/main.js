import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import less from 'less'
import ZkTable from 'vue-table-with-tree-grid'
Vue.use(less)
Vue.component('tree-table',ZkTable)
// 导入全局样式
import '@/assets/css/global.css'
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
