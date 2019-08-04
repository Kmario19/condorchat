const express = require('express')
const users = express.Router()
const requireAuth = require('../middlewares/requireAuth')

const User = require('../models/user')

users.get('/', requireAuth, (req, res) => {
    User.find({}, 'first_name last_name username', (err, users) => {
        if (err) return res.status(400).json(err)

        return res.json(users)
    })
})

users.get('/:username', requireAuth, (req, res) => {
    User.findOne({ username: new RegExp(req.params.username, 'i') }, '-password', (err, user) => {
        if (err) return res.status(400).json(err)

        if (!user) return res.status(404).json({ error: 'User not found' })

        return res.json(user)
    })
})

module.exports = users