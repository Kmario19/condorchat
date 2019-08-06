const express = require('express')
const chat = express.Router()
const requireAuth = require('../middlewares/requireAuth')

const User = require('../models/user')
const Group = require('../models/group')

/**
 * Load oter users and groups
 */
chat.get('/', requireAuth, async (req, res) => {
    let users = await User.find({ _id: { $ne: req.auth._id } }, '-password')
    let groups = await Group.find({}, '-password')
    res.json({ users, groups })
})

module.exports = chat