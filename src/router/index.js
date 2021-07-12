import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login/Login'
import Home from '@/views/home/Home'
import Welcome from '@/views/home/welcome/Welcome'
import Users from '@/views/home/users/Users'
import Rights from '@/views/power/Rights'
import Roles from '@/views/power/Roles'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  }, {
    path: '/home',
    name: "Home",
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    },{
      path:'/users',
      component:Users
    },{
      path:'/rights',
      component:Rights
    },{
      path:'/roles',
      component:Roles
    }]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
