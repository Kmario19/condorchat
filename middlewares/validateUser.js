const User = require('../models/user')

const validateUser = (req, res, next) => {
    let userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: req.body.password
    }

    // If exist id in the request, exclude this user
    const id = req.params.id

    // Verify if is empty - All required
    let error_field = null
    for (let key of Object.keys(userData)) {
        if (!userData[key] || !userData[key].trim().length) {
            error_field = key
            break
        }
    }

    // If is update, the password field is not required
    if (error_field == 'password' && id) {
        error_field = null
        if (!userData.password)
            delete userData.password
    }

    if (error_field) {
        return res.status(422).json({ error: 'The field is required', field: error_field })
    }
    
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