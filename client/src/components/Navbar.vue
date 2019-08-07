<template>
  <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <router-link class="navbar-brand col-sm-3 col-md-2 mr-0" to="/">CondorChat</router-link>
    <ul class="navbar-nav px-3">
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
      token: localStorage.usertoken
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('userData')
      localStorage.removeItem('usertoken')
      router.push({ name: 'Login' })
    }
  },
  mounted () {
    EventBus.$on('logged-in', status => {
      this.auth = status
    })
  }
}
</script>
