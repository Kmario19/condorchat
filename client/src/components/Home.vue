<template>
  <div class="container-fluid">
    <div class="row">
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
          <div class="my_user text-center mt-3" data-toggle="collapse" data-target="#userControls" aria-expanded="false" aria-controls="userControls">
            <img :src="imageUrl(auth.avatar)" width="80" height="80" class="avatar rounded">
            <h4 class="mb-0">{{ auth.first_name }} {{ auth.last_name }}</h4>
            <span class="text-muted">@{{ auth.username }}</span>
          </div>
          <div class="collapse" id="userControls">
            <ul class="nav flex-column text-center" >
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="form.profile.show_modal = true">
                  <icon icon="user" size="small" no-svg/> Profile
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="forceLogout">
                  <icon icon="logout" size="small" no-svg/> Logout
                </a>
              </li>
            </ul>
          </div>
          <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
            <span>Chat Rooms</span>
            <a class="d-flex align-items-center text-muted" v-on:click="form.group.new = !form.group.new">
              <icon icon="plus" size="small" no-svg/>
            </a>
          </h6>
          <div v-if="form.group.new" class="mb-2">
            <input type="text" class="sidebar_input" v-model="form.group.name" placeholder="Write a group name..." v-on:keyup.enter="submitNewGroup">
            <span class="text-danger px-3" v-if="form.group.error">{{ form.group.error }}</span>
          </div>
          <div class="text-center my-5" v-if="loading">
            <icon icon="reload" size="large" class="spin" no-svg/>
          </div>
          <ul class="nav flex-column mb-2 group-list" v-if="groups.length">
            <li class="nav-item" v-for="group in groups" v-bind:key="group._id">
              <a class="nav-link" v-bind:class="{ active: group_active == group }" href="#" v-on:click="joinChatGroup(group)">
                <strong># </strong>{{ group.name }}
                <span class="new_messages" v-if="group.new_messages"></span>
              </a>
            </li>
          </ul>
          <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
            <span>Direct Messages</span>
            <a class="d-flex align-items-center text-muted" v-on:click="form.user.find = !form.user.find, form.user.search = ''">
              <icon icon="magnifier" size="small" no-svg/>
            </a>
          </h6>
          <div v-if="form.user.find" class="mb-2">
            <input type="text" class="sidebar_input" v-model="form.user.search" placeholder="Search user...">
          </div>
          <div class="text-center my-5" v-if="loading">
            <icon icon="reload" size="large" class="spin" no-svg/>
          </div>
          <ul class="nav flex-column mb-2 user-list" v-if="filteredUsers.length">
            <li class="nav-item" v-for="user in filteredUsers" v-bind:key="user._id" v-bind:class="{ active: user_active == user }">
              <a class="nav-link user_item" href="#" v-on:click="joinChatUser(user)">
                <div class="user_avatar" v-bind:class="{online: user.online}">
                  <img :src="imageUrl(user.avatar)" width="36" height="36" class="avatar">
                </div>
                <div class="user_data">
                  <div class="user_name">{{ user.first_name }} {{ user.last_name }}</div>
                  <span class="user_alias">{{ user.username }}</span>
                </div>
                <span class="new_messages" v-if="user.new_messages"></span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <main role="main" class="col-md-10">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center p-3 border-bottom">
          <h3 class="m-0">{{ header_title }}</h3>
          <div class="btn-toolbar mb-2 mb-md-0" v-if="group_active && group_active.user == auth._id">
            <div class="btn-group mr-2">
              <button type="button" class="btn btn-sm btn-outline-info">EDIT</button>
              <button type="button" class="btn btn-sm btn-outline-danger">DELETE</button>
            </div>
          </div>
        </div>
        <div class="msg_container" v-bind:style="{ height: chatHeight + 'px' }">
          <div class="text-center my-5" v-if="loading_messages">
            <icon icon="reload" size="large" class="spin" no-svg/>
          </div>
          <div class="msg_history scroll_history">
            <div class="alert alert-info m-3" v-if="!user_active && !group_active">Select an user or chat room to start conversation</div>
            <div class="msg_item" v-for="message in messages" v-bind:key="message._id">
              <div class="msg_avatar">
                <img :src="imageUrl(message.user.avatar)" width="36" height="36" class="avatar">
                <span></span>
              </div>
              <div class="msg_content">
                <span class="msg_user">{{ message.user.username }}</span>
                <span class="msg_time">{{ message.timestamp | moment("h:mm A") }}</span>
                <div class="msg_body">{{ message.body }}</div>
              </div>
            </div>
          </div>
          <div class="msg_form" v-if="user_active || group_active">
            <input type="text" class="form-control" placeholder="Write something..." v-model="message" v-on:keyup.enter="sendMessage">
          </div>
        </div>
      </main>
    </div>
    <div class="modal-mask" v-if="form.profile.show_modal">
      <div class="modal-wrapper">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="profileModalLabel">Profile</h5>
              <button type="button" class="close" v-on:click="form.profile.show_modal = false">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <img :src="imageUrl(auth.avatar)" width="100" height="100" class="avatar">
                  <div class="form-group">
                    <label>
                      <input type="file" ref="avatar" name="avatar" id="avatar" class="form-control-file" v-on:change="handleFileUpload()">
                    </label>
                    <div class="text-danger" v-if="form.profile.error_field == 'avatar'">{{ form.profile.error_message }}</div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-6">
                  <div class="form-group">
                    <label for="first_name" class="form-control-label">First Name</label>
                    <input type="text" name="first_name" id="first_name" class="form-control"
                    v-bind:class="{ 'is-invalid': form.profile.error_field == 'first_name' }" v-model="auth.first_name">
                    <div class="invalid-feedback" v-if="form.profile.error_field == 'first_name'">{{ form.profile.error_message }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label for="last_name" class="form-control-label">Last Name</label>
                    <input type="text" name="last_name" id="last_name" class="form-control"
                    v-bind:class="{ 'is-invalid': form.profile.error_field == 'last_name' }" v-model="auth.last_name">
                    <div class="invalid-feedback" v-if="form.profile.error_field == 'first_name'">{{ form.profile.error_message }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label for="username" class="form-control-label">Username</label>
                    <input type="text" name="username" id="username" class="form-control"
                    v-bind:class="{ 'is-invalid': form.profile.error_field == 'username' }" v-model="auth.username">
                    <div class="invalid-feedback" v-if="form.profile.error_field == 'first_name'">{{ form.profile.error_message }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label class="form-control-label">Registered</label>
                    <input type="text" class="form-control" v-bind:value="auth.registered | moment('Y-MM-DD H:m:s')" readonly>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary pull-left" v-on:click="form.profile.show_modal = false">Close</button>
              <button type="button" class="btn btn-primary" v-on:click="submitFormProfile()">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'
import icon from 'vue-simple-line'
import router from '../router'
import EventBus from './EventBus.vue'
export default {
  components: {
    icon
  },
  data () {
    return {
      socket: io('http://localhost:5000'),
      token: localStorage.userToken,
      auth: JSON.parse(localStorage.userData || '{}'),
      loading: true,
      loading_messages: false,
      chatHeight: 0,
      users: [],
      groups: [],
      messages: [],
      group_active: null,
      user_active: null,
      header_title: 'Welcome to CondorChat',
      form: {
        group: {
          new: false,
          error: null,
          name: null
        },
        user: {
          find: false,
          search: ''
        },
        profile: {
          show_modal: false,
          avatar: null,
          error_field: '',
          error_message: ''
        },
        messages: {
          search: ''
        }
      },
      message: ''
    }
  },
  mounted () {
    axios
      .get('/api/chat', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      .then(res => {
        this.users = res.data.users
        this.groups = res.data.groups
        this.loading = false
        EventBus.$emit('logged-in', 'loggedin')
        this.socket.emit('login', this.auth)
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          this.forceLogout()
        }
      })
    // Resize chat height
    this.updateChatHeight()
    this.$nextTick(() => {
      window.addEventListener('resize', this.updateChatHeight)
    })

    this.socket.on('connect', () => {
      if (this.auth.new_user) {
        delete this.auth.new_user
        localStorage.setItem('userData', JSON.stringify(this.auth))
        this.socket.emit('new user', this.auth)
      }
    })

    this.socket.on('users_connected', (usersConnected) => {
      usersConnected = usersConnected.map(uc => uc.user)
      for (let i = 0; i < this.users.length; i++) {
        this.users[i].online = usersConnected.includes(this.users[i]._id)
      }
      this.$forceUpdate()
    })

    this.socket.on('login', (user) => {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === user._id) {
          this.users[i].online = true
          break
        }
      }
      this.$forceUpdate()
    })

    this.socket.on('logout', (user) => {
      console.log('User disconected', user)
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === user) {
          this.users[i].online = false
          break
        }
      }
      this.$forceUpdate()
    })

    this.socket.on('new group', (group) => {
      this.groups.push(group)
    })

    this.socket.on('new user', (user) => {
      user.online = true
      this.users.push(user)
    })

    this.socket.on('update user', (user) => {
      console.log(user)
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === user._id) {
          console.log('Encontrado')
          this.users[i].first_name = user.first_name
          this.users[i].last_name = user.last_name
          this.users[i].username = user.username
          this.users[i].avatar = user.avatar + '?' + (new Date()).getTime()
          break
        }
      }
    })

    this.socket.on('message', (data) => {
      for (let i = 0; i < this.groups.length; i++) {
        if (this.groups[i].name === data.room) {
          if (this.groups[i] !== this.group_active) {
            this.groups[i].new_messages = true
          }
          this.groups[i].messages.push(data.message)
          break
        }
      }
      this.$forceUpdate()
    })

    this.socket.on('direct', (data) => {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === data.user._id) {
          if (this.user_active !== this.users[i]) {
            this.users[i].new_messages = true
          }
          if (!this.users[i].messages) {
            this.users[i].messages = []
          }
          this.users[i].messages.push(data)
          break
        }
      }
      this.$forceUpdate()
    })
  },
  methods: {
    updateChatHeight () {
      let docHeight = document.documentElement.clientHeight
      // Client height - header - title - formchat
      this.chatHeight = docHeight - (48 + 66 + 58)
    },
    scrollChatBottom () {
      let container = document.querySelector('.scroll_history')
      container.scrollTop = container.scrollHeight
    },
    joinChatUser (user) {
      this.user_active = user
      this.group_active = null
      this.header_title = user.first_name + ' ' + user.last_name
      this.user_active.new_messages = false
      if (user.messages_ready) {
        this.messages = user.messages
      } else {
        this.messages = []
        this.loading_messages = true
        axios
          .get('/api/chat/direct/' + user._id, {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
          .then(res => {
            this.messages = user.messages = res.data.messages
            user.messages_ready = true
            this.loading_messages = false
            this.socket.emit('suscribe user', user)
          })
          .catch(err => {
            if (err.response && err.response.status === 401) {
              this.forceLogout()
            }
            this.loading_messages = false
          })
      }
    },
    joinChatGroup (group) {
      this.group_active = group
      this.user_active = null
      this.header_title = '#' + group.name
      this.messages = group.messages
      this.group_active.new_messages = false
    },
    submitNewGroup () {
      axios
        .post('/api/groups', {name: this.form.group.name}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(res => {
          this.form.group.new = false
          this.form.group.name = null
          this.form.group.error = null
          this.groups.push(res.data.group)
          this.joinChatGroup(res.data.group)
          this.socket.emit('new group', res.data.group)
        })
        .catch(err => {
          if (err.response && err.response.status === 422) {
            this.form.group.error = err.response.data.error
          } else if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    },
    forceLogout () {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      this.socket.close()
      router.push({ name: 'Login' })
    },
    sendMessage () {
      this.message = this.message.trim()
      if (this.message.length) {
        let newMessage = {
          body: this.message,
          user: this.auth,
          timestamp: new Date()
        }
        if (this.group_active) {
          this.sendToGroup(newMessage)
        } else if (this.user_active) {
          this.sendToUser(newMessage)
        }
      }
      this.message = ''
    },
    sendToGroup (newMessage) {
      this.group_active.messages.push(newMessage)
      this.socket.emit('message', { message: newMessage, room: this.group_active.name })
      axios
        .post('/api/chat/group', {group_id: this.group_active._id, body: this.message}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(res => {
          // Ok :)
        })
        .catch(err => {
          if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    },
    sendToUser (newMessage) {
      this.user_active.messages.push(newMessage)
      axios
        .post('/api/chat/direct', {user_id: this.user_active._id, body: this.message}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(res => {
          res.data.message.to_user = { _id: this.user_active._id, username: this.user_active.username }
          res.data.message.user = { _id: this.auth._id, username: this.auth.username }
          this.socket.emit('direct', res.data.message)
        })
        .catch(err => {
          if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    },
    handleFileUpload () {
      this.form.profile.avatar = this.$refs.avatar.files[0]
    },
    submitFormProfile () {
      let formData = new FormData()
      if (this.form.profile.avatar) {
        formData.append('avatar', this.form.profile.avatar)
      }
      formData.append('first_name', this.auth.first_name)
      formData.append('last_name', this.auth.last_name)
      formData.append('username', this.auth.username)
      axios
        .post('/api/users/' + this.auth._id, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(res => {
          this.auth.avatar = res.data.avatar
          this.socket.emit('update user', res.data)
          this.form.profile.show_modal = false
          localStorage.setItem('userData', JSON.stringify(this.auth))
          this.auth.avatar += '?' + (new Date()).getTime()
        })
        .catch(err => {
          if (err.response && err.response.status === 422) {
            this.form.profile.error_message = err.response.data.error
            this.form.profile.error_field = err.response.data.field
          } else if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    },
    imageUrl (avatar) {
      return avatar ? '/avatar/' + avatar : '/avatar/default.jpg'
    }
  },
  computed: {
    filteredUsers () {
      return this.users.filter(user => {
        return `${user.first_name} ${user.last_name} ${user.username}`.toLowerCase()
          .includes(this.form.user.search.toLowerCase().trim())
      })
    },
    filteredMessages () {
      return this.messages.filter(message => {
        return message.body.toLowerCase()
          .includes(this.form.messages.search.toLowerCase().trim())
      })
    }
  },
  beforeDestroy () {
    this.socket.close()
  },
  watch: {
    messages () {
      this.$nextTick(this.scrollChatBottom)
    }
  }
}
</script>

<style>
.msg_history {
  height: 100%;
  overflow-y: auto
}
.msg_item {
  padding: 6px 10px 6px 55px;
  position: relative
}
.msg_avatar {
  position: absolute;
  top: 10px;
  left: 10px;
}
.msg_avatar img {
  background: #fff;
  border-radius: 4px;
}
.msg_avatar span {
  display: none; /* Not Yet */
  position: absolute;
  padding: 4px;
  border-radius: 100%;
  bottom: 3px;
  right: 3px;
  background: gray;
  box-shadow: inset 0px 0px 1px 0px rgba(0, 0, 0, 0.8);
}
.msg_content .msg_user {
  font-weight: 600;
}
.msg_content .msg_time {
  color: #999;
}
.msg_content .msg_body {
  color: #1d1c1d;
  word-wrap: break-word;
}
.msg_form {
  padding: 10px 0
}
.msg_form .form-control {
  resize: none
}
.nav-link {
  padding: 0.3rem 1rem;
}
.sidebar_input {
  width: 100%;
  border: none;
  border-bottom: solid 1px #0000002e;
  padding: 5px 16px;
  background: transparent;
  outline: none;
}
i.sli-font.small {
  font-size: 15px;
  cursor: pointer
}
.active {
  background: #00000008;
}
.user_item {
  position: relative;
  line-height: 1.2;
  padding-left: 50px;
}
.user_item .user_avatar {
  position: absolute;
  left: 15px;
  top: 11px
}
.user_item .user_avatar img {
  border-radius: 100%;
  height: 26px;
  width: 26px;
  background: #fff;
  box-shadow: 0 0 0 2px #999
}
.user_item .user_avatar.online img {
  box-shadow: 0 0 0 2px #8bc34a
}
.user_item .user_alias {
  font-weight: normal;
  color: #666
}
.my_user {
  cursor: pointer
}
.new_messages {
  position: absolute;
  background: #8bc34a;
  padding: 5px;
  top: 10px;
  right: 18px;
  border-radius: 100%;
  border: solid 1px #1d1c1d;
}
.group-list .nav-link {
  position: relative
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}
.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
</style>
