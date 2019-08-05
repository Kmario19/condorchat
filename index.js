const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = process.env.PORT || 5000

const auth = require('./routes/auth')
const users = require('./routes/users')
const groups = require('./routes/groups')

mongoose.connect('mongodb://localhost/condorchat', { useNewUrlParser: true })
mongoose.set('useFindAndModify', false); // For can use findByIdAndUpdate

const server = app.listen(port, () => {
    console.log('API server is running on port: ' + port)
})

const io = require('socket.io')(server)
const Chat = require('./lib/chat')(io)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
})

app.use(auth)

app.use('/users', users)

app.use('/groups', groups)

app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not found' })
})