<template>
  <div class="container">
    <div class="jumbotron mt-5">
      <div class="col-sm-8 mx-auto">
        <h1 class="text-center">PROFILE</h1>
      </div>
      <table class="table col-md-6 mx-auto">
        <tbody>
          <tr>
            <td>Fist Name</td>
            <td>{{first_name}}</td>
          </tr>
          <tr>
            <td>Last Name</td>
            <td>{{last_name}}</td>
          </tr>
          <tr>
            <td>Username</td>
            <td>{{username}}</td>
          </tr>
          <tr>
            <td>Registered</td>
            <td>{{registered.toLocaleString()}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    const userData = localStorage.userData
    const decoded = JSON.parse(userData || '{}')
    return {
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      username: decoded.username,
      registered: new Date(decoded.registered)
    }
  }
}
</script>
