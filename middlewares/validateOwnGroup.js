const Group = require('../models/group')

/**
 * Middleware to verify the auth user, must be the group creator
 */
const validateOwnGroup = (req, res, next) => {
    const id = req.params.id

    Group.findById(id, (err, group) => {
        if (err) return res.status(400).json(err)

        if (!group) return res.status(404).json({ error: 'Group not exist' })

        if (!group.user.equals(req.auth._id))
            return res.status(403).json({ error: 'You can\'t access to this group' })

        next()
    })
}

module.exports = validateOwnGroup