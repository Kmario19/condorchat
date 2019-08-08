const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('./config')
const port = process.env.PORT || config.PORT

const auth = require('./routes/auth')
const users = require('./routes/users')
const groups = require('./routes/groups')
const chat = require('./routes/chat')

/**
 * Connect to database
 */
mongoose.connect('mongodb://localhost/' + config.MG_DATABASE, { useNewUrlParser: true })
mongoose.set('useFindAndModify', false); // For can use findByIdAndUpdate

// Run Server
const server = app.listen(port, () => {
    console.log('API server is running on port: ' + port)
})

// Use the same port server to socket
const io = require('socket.io')(server)

// Load all socket events
const Chat = require('./lib/socket_events')(io)

// Configure express
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


/**
 * Load all routes
 */
app.use('/upload', express.static('upload')); // For avatars

app.use('/api', auth)

app.use('/api/chat', chat)

app.use('/api/users', users)

app.use('/api/groups', groups)

// 404 Not Found
app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not found' })
})