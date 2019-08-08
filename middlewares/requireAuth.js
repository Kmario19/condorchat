const express = require('express')
const app = express.Router()

const verifyToken = require('./verifyToken')
const verifyUser = require('./verifyUser')

/**
 * First validate the token
 * Second, load user with jwt
 * If exist and is valid, continue
 */
app.use(verifyToken, verifyUser, (req, res, next) => {
    if (!req.auth)
        return res.status(401).json({ error: 'Unauthorized' })

    next()
})

module.exports = app