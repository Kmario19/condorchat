const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = process.env.PORT || 5000

const auth = require('./routes/auth')
const users = require('./routes/users')

mongoose.connect('mongodb://localhost/condorchat', { useNewUrlParser: true })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('Ready')
})

app.use(auth)

app.use('/users', users)

app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not found' })
});

app.listen(port, () => {
    console.log('Server is running on port: ' + port)
})