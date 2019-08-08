const express = require('express')
const auth = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../config')

const validateUser = require('../middlewares/validateUser')

/**
 * Crypt id only
 * @param {String} id 
 */
const registerToken = (id) => jwt.sign({ userId: id }, config.TOKEN_KEY, { expiresIn: '24h' })

/**
 * Login user
 * Find by regex to sensitive case
 */
auth.post('/login', (req, res) => {
    User.findOne({ username: new RegExp(`^${req.body.username}$`, 'i') }, (err, user) => {
        if (err) return res.status(400).json(err)

        if (user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
            return res.json({
                message: 'Logged in successfully',
                token: registerToken(user._id),
                user: {
                    _id: user._id,
                    avatar: user.avatar,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    registered: user.registered,
                    avatar: user.avatar
                }
            })
        }

        return res.status(422).json({ error: 'Username or password incorrect' })
    })
})

/**
 * Register new user
 */
auth.post('/register', validateUser, (req, res) => {
    req.user.password = bcrypt.hashSync(req.user.password, 10)

    let user = new User(req.user)

    user.save((err, user) => {
        if (err) return res.status(400).json(err)
        return res.json({
            message: 'User created',
            token: registerToken(user._id), user: {
                _id: user._id,
                avatar: user.avatar,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                registered: user.registered
            }
        })
    })
})

module.exports = auth