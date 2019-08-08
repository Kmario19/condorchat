const express = require('express')
const users = express.Router()
const bcrypt = require('bcrypt')
const fileUpload = require('express-fileupload')
const requireAuth = require('../middlewares/requireAuth')
const validateUser = require('../middlewares/validateUser')
const validateAvatar = require('../middlewares/validateAvatar')

const User = require('../models/user')

users.use(fileUpload({ // For upload avatar
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

/**
 * List of users
 */
users.get('/', requireAuth, (req, res) => {
    User.find({}, '-password', (err, users) => {
        if (err) return res.status(400).json(err)

        return res.json(users)
    })
})

/**
 * Get user by username
 */
users.get('/:username', requireAuth, (req, res) => {
    User.findOne({ username: new RegExp(req.params.username, 'i') }, '-password', (err, user) => {
        if (err) return res.status(400).json(err)

        if (!user) return res.status(404).json({ error: 'User not found' })

        return res.json(user)
    })
})

/**
 * Update user
 */
users.post('/:id', requireAuth, validateUser, validateAvatar, (req, res) => {
    // Upload avatar image with user id
    if (req.files && Object.keys(req.files).length && req.files.avatar) {
        let filename_parts = req.files.avatar.name.split('.')
        req.user.avatar = req.params.id + '.' + filename_parts[filename_parts.length - 1]
        req.files.avatar.mv(__dirname + '/../upload/avatar/' + req.user.avatar, (err) => {
            if (err) console.log(err)
        })
    }

    if (req.user.password) {
        req.user.password = bcrypt.hashSync(req.user.password, 10)
    }

    User.findByIdAndUpdate(req.params.id, req.user, { new: true }, (err, user) => {
        if (err) return res.status(400).json(err)

        if (!user) return res.status(404).json({ error: 'User not found' })

        return res.json({
            _id: user._id,
            avatar: user.avatar,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            registered: user.registered
        })
    })
})

module.exports = users