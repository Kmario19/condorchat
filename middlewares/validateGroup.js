const Group = require('../models/group')

/**
 * Validate group data before create and store object
 */
const validateGroup = (req, res, next) => {
    const name = req.body.name

    // Verify if is empty
    if (!name || !name.trim().length)
        return res.status(422).json({ error: 'The field is required', field: 'name' })

    // If exist id in the request, exclude this group
    const id = req.params.id

    // Check if exist with same name (regex for case sensitive)
    Group.findOne({ name: new RegExp(`^${name}$`, 'i'), _id: { $ne: id } }, '_id', (err, obj) => {
        if (err) return res.status(400).json(err)

        if (obj) return res.status(422).json({ error: 'Group already exists' })

        req.group = { name, user: req.auth._id }

        next()
    })
}

module.exports = validateGroup