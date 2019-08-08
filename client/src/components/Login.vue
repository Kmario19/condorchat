<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 mx-auto login-container">
        <form v-on:submit.prevent="login">
          <div class="text-center mb-4">
            <img src="@/assets/logo.png" width="100" height="100">
          </div>
          <h1 class="h3 mb-3 font-weight-normal text-center text-uppercase">LOGIN</h1>
          <div class="form-group">
            <label for="email">Username</label>
            <input type="text" v-model="username" class="form-control" name="username" placeholder="Enter username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" v-model="password" class="form-control" name="password"
            v-bind:class="{ 'is-invalid': error }" placeholder="Password" required />
            <div class="invalid-feedback" v-if="error">{{ error }}</div>
          </div>
          <button type="submit" class="btn btn-lg btn-primary btn-block">Sign in</button>
          <p class="my-3 text-center">Or don't have account yet?</p>
          <router-link type="submit" class="btn btn-lg btn-secondary btn-block" to="/register">Sign up</router-link>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import router from '../router'
import EventBus from './EventBus'
export default {
  data () {
    return {
      username: '',
      password: '',
      error: null
    }
  },
  methods: {
    login () {
      axios
        .post('/api/login', {
          username: this.username,
          password: this.password
        })
        .then(res => {
          localStorage.setItem('userToken', res.data.token)
          localStorage.setItem('userData', JSON.stringify(res.data.user))
          router.push({ name: 'Home' })
          this.emitMethod()
        })
        .catch(err => {
          localStorage.removeItem('userToken')
          localStorage.removeItem('userData')
          if (err.response && err.response.status === 422) {
            console.log(err.response.data)
            this.error = err.response.data.error
          }
        })
    },
    emitMethod () {
      EventBus.$emit('logged-in', 'loggedin')
    }
  }
}
</script>

<style>
.login-container {
  margin-top: 7em
}
</style>
