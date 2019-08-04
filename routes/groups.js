const express = require('express')
const groups = express.Router()
const requireAuth = require('../middlewares/requireAuth')
const validateGroup = require('../middlewares/validateGroup')
const validateOwnGroup = require('../middlewares/validateOwnGroup')

const Group = require('../models/group')

/**
 * List of groups
 */
groups.get('/', requireAuth, (req, res) => {
    Group.find({}, 'name', (err, groups) => {
        if (err) return res.status(400).json(err)

        return res.json(groups)
    })
})

/**
 * Create group
 */
groups.post('/', requireAuth, validateGroup, (req, res) => {

    let group = new Group(req.group)

    group.save((err, group) => {
        if (err) return res.status(400).json(err)

        return res.json({ message: 'Group created', group })
    })
})

/**
 * Get group by name
 */
groups.get('/:name', requireAuth, (req, res) => {
    Group.findOne({ name: new RegExp(req.params.name, 'i') }, (err, group) => {
        if (err) return res.status(400).json(err)

        if (!group) return res.status(404).json({ error: 'Group not found' })

        return res.json(group)
    })
})

/**
 * Update group
 */
groups.post('/:id', requireAuth, validateOwnGroup, validateGroup, (req, res) => {
    Group.findByIdAndUpdate(req.params.id, { name: req.group.name }, { new: true }, (err, group) => {
        if (err) return res.status(400).json(err)

        if (!group) return res.status(404).json({ error: 'Group  updated', group })

        return res.json(group)
    })
})

/**
 * Delete group
 */
groups.delete('/:id', requireAuth, validateOwnGroup, (req, res) => {
    Group.findByIdAndRemove(req.params.id, (err, group) => {
        if (err) return res.status(400).json(err)
        // group param for a possible undo?
        return res.json({ message: 'Group deleted', group })
    })
})

module.exports = groups