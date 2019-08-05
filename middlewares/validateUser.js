const User = require('../models/user')

const validateUser = (req, res, next) => {
    let userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: req.body.password
    }

    // Verify if is empty - All required
    Object.keys(userData).forEach((key) => {
        if (!userData[key] || !userData[key].trim().length)
            return res.status(422).json({ error: 'The field is required', field: key })
    })

    // If exist id in the request, exclude this group
    const id = req.params.id
    
    // Then, check if am i
    if (id && !req.auth._id.equals(id))
        return res.status(403).json({ error: 'You can\'t access' })

    // Check if exist with same username (regex for case sensitive)
    User.findOne({ username: new RegExp(userData.username, 'i'), _id: { $ne: id } }, '_id', (err, obj) => {
        if (err) return res.status(400).json(err)

        if (obj) return res.status(422).json({ error: 'Username already exists', field: 'username' })

        req.user = userData

        next()
    })
}

module.exports = validateUser