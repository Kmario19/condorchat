
/**
 * Validate message data before create and store object
 * The user id or group id must be present
 */
const validateMessage = (req, res, next) => {
    const body = req.body.body

    // Verify if is empty
    if (!body || !body.trim().length)
        return res.status(422).json({ error: 'The field is required', field: 'body' })

    // One of this must be present
    if (!req.body.group_id && !req.body.user_id)
        return res.status(422).json({ error: 'Recipient not especified', field: 'body' })

    req.message = { body, user: req.auth._id, timestamp: new Date() }

    next()
}

module.exports = validateMessage