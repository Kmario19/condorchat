<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 mt-5 mx-auto">
        <form v-on:submit.prevent="login">
          <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
          <div class="form-group">
            <label for="email">Username</label>
            <input
              type="text"
              v-model="username"
              class="form-control"
              name="username"
              placeholder="Enter username"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              v-model="password"
              class="form-control"
              name="password"
              placeholder="Password"
            />
          </div>
          <button type="submit" class="btn btn-lg btn-primary btn-block">Sign in</button>
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
      password: ''
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
          console.log(err)
        })
    },
    emitMethod () {
      EventBus.$emit('logged-in', 'loggedin')
    }
  }
}
</script>
