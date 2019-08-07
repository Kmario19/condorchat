const express = require('express')
const chat = express.Router()
const requireAuth = require('../middlewares/requireAuth')
const validateMessage = require('../middlewares/validateMessage')

const User = require('../models/user')
const Group = require('../models/group')
const Message = require('../models/message')

/**
 * Load other users and groups
 */
chat.get('/', requireAuth, async (req, res) => {
    let users = await User.find({ _id: { $ne: req.auth._id } }, '-password')
    let groups = await Group.find({}, '-password').populate('messages.user')
    res.json({ users, groups })
})

/**
 * Get conversation
 * Any message where include us in `user` and `to_user`
 */
chat.get('/direct/:user_id', requireAuth, async (req, res) => {
    let messages = await Message.find({
        $or: [
            { $and: [{ user: req.auth._id, to_user: req.params.user_id }] },
            { $and: [{ user: req.params.user_id, to_user: req.auth._id }] }
        ]
    }).populate('user')
    res.json({ messages })
})

/**
 * Get group chat
 */
chat.get('/group/:group_id', requireAuth, async (req, res) => {
    let group = await Group.find({ _id: req.params.group_id }).populate('messages.user')
    res.json({ messages: group.messages })
})

/**
 * Save groupal message
 */
chat.post('/group', requireAuth, validateMessage, async (req, res) => {
    Group.updateOne({ _id: req.body.group_id }, { $push: { messages: message } }, (err, result) => {
        if (err) return res.status(400).json(err)

        return res.json({ message: 'Message sent', result })
    })
})

/**
 * Save direct message
 */
chat.post('/direct', requireAuth, validateMessage, async (req, res) => {
    req.message.to_user = req.body.user_id

    let message = new Message(req.message)

    message.save((err, message) => {
        if (err) return res.status(400).json(err)

        return res.json({ message: 'Group created' })
    })
})

module.exports = chat