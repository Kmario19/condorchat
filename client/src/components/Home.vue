<template>
  <div class="container-fluid">
    <div class="row">
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
          <div class="my_user text-center mt-3" data-toggle="collapse" data-target="#userControls" aria-expanded="false" aria-controls="userControls">
            <img src="@/assets/logo.png" width="50" height="50" class="avatar rounded">
            <h4>Carlos Ramos</h4>
          </div>
          <div class="collapse" id="userControls">
            <ul class="nav flex-column text-center" >
              <li class="nav-item">
                <router-link class="nav-link" to="/profile">
                  <icon icon="user" size="small" no-svg/> Profile
                </router-link>
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
          <ul class="nav flex-column mb-2" v-if="groups.length">
            <li class="nav-item" v-for="group in groups" v-bind:key="group._id">
              <a class="nav-link" v-bind:class="{ active: group_active == group }" href="#" v-on:click="joinChatGroup(group)">
                <strong># </strong>{{ group.name }}
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
                  <img src="@/assets/logo.png" width="36" height="36" class="avatar">
                </div>
                <div class="user_data">
                  <div class="user_name">{{ user.first_name }} {{ user.last_name }}</div>
                  <span class="user_alias">{{ user.username }}</span>
                </div>
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
          <div class="msg_history">
            <div class="alert alert-info m-3" v-if="!user_active && !group_active">Select an user or chat room to start conversation</div>
            <div class="msg_item" v-for="message in messages" v-bind:key="message._id">
              <div class="msg_avatar">
                <img src="@/assets/logo.png" width="36" height="36" class="avatar">
                <span></span>
              </div>
              <div class="msg_content">
                <span class="msg_user">{{ message.user.username }}</span>
                <span class="msg_time">{{ message.timestamp }}</span>
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
      })
      .catch(err => {
        console.log(err)
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
      console.log('conected socket')
      this.socket.emit('login', this.auth)
    })

    this.socket.on('users_connected', (usersConnected) => {
      for (let i = 0; i < this.users.length; i++) {
        this.users[i].online = usersConnected.includes(this.users[i]._id)
      }
    })

    this.socket.on('login', (user) => {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === user._id) {
          this.users[i].online = true
          break
        }
      }
    })

    this.socket.on('logout', (user) => {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]._id === user._id) {
          this.users[i].online = true
          break
        }
      }
    })

    this.socket.on('new group', (group) => {
      this.groups.push(group)
      this.socket.emit('suscribe', group)
    })

    this.socket.on('new user', (user) => {
      this.users.push(user)
    })

    this.socket.on('message', (data) => {
      console.log(data)
    })

    this.socket.on('direct', (data) => {
      console.log(data)
    })
  },
  methods: {
    updateChatHeight () {
      let docHeight = document.documentElement.clientHeight
      // Client height - header - title - formchat
      this.chatHeight = docHeight - (48 + 66 + 58)
    },
    joinChatUser (user) {
      this.user_active = user
      this.group_active = null
      this.header_title = user.first_name + ' ' + user.last_name
      if (user.messages_ready) {
        this.messages = user.messages
      } else {
        this.messages = []
        this.loading_messages = true
        console.log(user._id)
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
          })
          .catch(err => {
            console.log(err)
            if (err.response && err.response.status === 401) {
              // this.forceLogout()
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
          console.log(err)
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
      this.socket.emit('message', {
        message: this.message,
        user: this.auth,
        room: this.group_active.name
      })
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
          console.log(err)
          if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    },
    sendToUser (newMessage) {
      this.user_active.messages.push(newMessage)
      this.socket.emit('direct', {
        message: this.message,
        user: this.auth,
        to_user: this.user_active
      })
      axios
        .post('/api/chat/direct', {user_id: this.user_active._id, body: this.message}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(res => {
          // Ok :)
        })
        .catch(err => {
          console.log(err)
          if (err.response && err.response.status === 401) {
            this.forceLogout()
          }
        })
    }
  },
  computed: {
    filteredUsers () {
      return this.users.filter(user => {
        return `${user.first_name} ${user.last_name} ${user.username}`.toLowerCase()
          .includes(this.form.user.search.toLowerCase().trim())
      })
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
</style>
