const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = process.env.PORT || 5000

const auth = require('./routes/auth')
const users = require('./routes/users')
const groups = require('./routes/groups')
const chat = require('./routes/chat')

mongoose.connect('mongodb://localhost/condorchat', { useNewUrlParser: true })
mongoose.set('useFindAndModify', false); // For can use findByIdAndUpdate

const server = app.listen(port, () => {
    console.log('API server is running on port: ' + port)
})

const io = require('socket.io')(server)
const Chat = require('./lib/chat')(io)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/upload', express.static('upload'));

app.use('/api', auth)

app.use('/api/chat', chat)

app.use('/api/users', users)

app.use('/api/groups', groups)

app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not found' })
})