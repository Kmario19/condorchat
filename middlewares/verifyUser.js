const jwt = require('jsonwebtoken')
const config = require('../config')

const User = require('../models/user')

/**
 * Find user with token (encrypted id)
 */
const verifyUser = (req, res, next) => {
    jwt.verify(req.token, config.TOKEN_KEY, (err, payload) => {
        if (payload) {
            User.findById(payload.userId, '-password', (err, user) => {
                req.auth = user
                next()
            })
        } else {
            next()
        }
    })
}

module.exports = verifyUser