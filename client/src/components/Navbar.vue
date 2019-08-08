<template>
  <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <button class="navbar-toggler d-block d-sm-none" type="button" v-on:click="toggleSidebar">
        <span class="navbar-toggler-icon"></span>
    </button>
    <router-link class="navbar-brand col-sm-3 col-md-2 mr-0 d-none d-sm-block" to="/">CondorChat</router-link>
    <ul class="navbar-nav px-3 d-none d-sm-block">
        <li v-if="auth=='loggedin' || token!=null || token!=undefined" class="nav-item">
          <a class="nav-link" href="#" v-on:click="logout">Logout</a>
        </li>
    </ul>
  </nav>
</template>

<script>
import EventBus from './EventBus'
import router from '../router'
export default {
  data () {
    return {
      auth: '',
      token: localStorage.usertoken,
      open_sidebar_mobile: false
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('userData')
      localStorage.removeItem('usertoken')
      router.push({ name: 'Login' })
    },
    toggleSidebar () {
      this.open_sidebar_mobile = !this.open_sidebar_mobile
      EventBus.$emit('toggle-sidebar', this.open_sidebar_mobile)
    }
  },
  mounted () {
    EventBus.$on('logged-in', status => {
      this.auth = status
    })
    EventBus.$on('toggle-sidebar', (status) => {
      this.open_sidebar_mobile = status
    })
  }
}
</script>
