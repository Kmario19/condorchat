import Vue from 'vue'
import Router from 'vue-router'
import Moment from 'vue-moment'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Register from '@/components/Register'

Vue.use(Router)
Vue.use(Moment)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        guest: true
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        guest: true
      }
    }
  ]
})

/**
 * Simple middleware to verify if guest or auth
 */
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('userToken') != null && localStorage.getItem('userData') != null) {
      next()
    } else {
      next({ name: 'Login' })
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (localStorage.getItem('userToken') == null || localStorage.getItem('userData') == null) {
      next()
    } else {
      next({ name: 'Home' })
    }
  } else {
    next()
  }
})

export default router
