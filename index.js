const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const Users = require('./routes/Users')

app.get('/', (req, res) => {
    res.send('Ready')
})

app.use('/users', Users)

app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not found' })
});

app.listen(port, () => {
    console.log('Server is running on port: ' + port)
})