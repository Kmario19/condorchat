const express = require('express')
const auth = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const global = require('../global')

const validateUser = require('../middlewares/validateUser')

const registerToken = (id) => jwt.sign({ userId: id }, global.TOKEN_KEY, { expiresIn: '24h' })

auth.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) return res.status(400).json(err)

        if (user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
            return res.json({
                message: 'Logged in successfully',
                token: registerToken(user._id),
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    registered: user.registered,
                    avatar: user.avatar
                }
            })
        }

        return res.status(404).json({ error: 'Username or password incorrect' })
    })
})

auth.post('/register', validateUser, (req, res) => {
    req.user.password = bcrypt.hashSync(req.user.password, 10)

    let user = new User(req.user)

    user.save((err, user) => {
        if (err) return res.status(400).json(err)
        return res.json({
            message: 'User created',
            token: registerToken(user._id), user: {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                registered: user.registered
            }
        })
    })
})

module.exports = auth