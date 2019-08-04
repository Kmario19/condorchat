const jwt = require('jsonwebtoken')
const global = require('../global')

const User = require('../models/user')

const verifyUser = (req, res, next) => {
    jwt.verify(req.token, global.TOKEN_KEY, (err, payload) => {
        if (payload) {
            User.findById(payload.userId, '-password', (err, user) => {
                req.user = user
                next()
            })
        } else {
            next()
        }
    })
}

module.exports = verifyUser