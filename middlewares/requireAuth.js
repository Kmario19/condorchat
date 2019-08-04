const express = require('express')
const app = express.Router()

const verifyToken = require('./verifyToken')
const verifyUser = require('./verifyUser')

app.use(verifyToken, verifyUser, (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' })

    next()
})

module.exports = app