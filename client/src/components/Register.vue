<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 mx-auto register-container">
        <form v-on:submit.prevent="register">
          <h1 class="h3 mb-3 font-weight-normal text-center text-uppercase">Register</h1>
          <div class="form-group">
            <label for="name">First name</label>
            <input type="text" v-model="first_name" class="form-control"
            v-bind:class="{ 'is-invalid': error_field == 'first_name' }" name="first_name" placeholder="Enter your first name">
            <div class="invalid-feedback" v-if="error_field == 'first_name'">{{ error_message }}</div>
          </div>
          <div class="form-group">
            <label for="name">Last name</label>
            <input type="text" v-model="last_name" class="form-control"
            v-bind:class="{ 'is-invalid': error_field == 'last_name' }" name="last_name" placeholder="Enter your lastname name">
            <div class="invalid-feedback" v-if="error_field == 'last_name'">{{ error_message }}</div>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" v-model="username" class="form-control"
            v-bind:class="{ 'is-invalid': error_field == 'username' }" name="username" placeholder="Enter your username">
            <div class="invalid-feedback" v-if="error_field == 'username'">{{ error_message }}</div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" v-model="password" class="form-control"
            v-bind:class="{ 'is-invalid': error_field == 'password' }" name="password" placeholder="Password">
            <div class="invalid-feedback" v-if="error_field == 'password'">{{ error_message }}</div>
          </div>
          <button type="submit" class="btn btn-lg btn-primary btn-block">Register!</button>
          <p class="my-3 text-center">Or do you have an account?</p>
          <router-link type="submit" class="btn btn-lg btn-secondary btn-block" to="/login">Login</router-link>
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
      error_field: '',
      error_message: '',
      first_name: '',
      last_name: '',
      username: '',
      password: ''
    }
  },
  methods: {
    register () {
      axios.post('/api/register',
        {
          first_name: this.first_name,
          last_name: this.last_name,
          username: this.username,
          password: this.password
        }
      ).then((res) => {
        localStorage.setItem('userToken', res.data.token)
        // For send event: new user
        res.data.user.new_user = true
        localStorage.setItem('userData', JSON.stringify(res.data.user))
        router.push({ name: 'Home' })
        this.emitMethod()
      }).catch(err => {
        console.log(err)
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
        if (err.response && err.response.status === 422) {
          this.error_message = err.response.data.error
          this.error_field = err.response.data.field
        }
      })
    },
    emitMethod () {
      EventBus.$emit('logged-in', 'loggedin')
    }
  },
  computed: {
    compoundProperty () {
      // method to compare if form data whas changed
      return [this.first_name, this.last_name, this.username, this.password].join()
    }
  },
  watch: {
    compoundProperty () {
      if (this.error_field !== '') {
        this.error_field = ''
      }
      if (this.error_message !== '') {
        this.error_message = ''
      }
    }
  }
}
</script>

<style>
.register-container {
  margin-top: 7em
}
</style>
