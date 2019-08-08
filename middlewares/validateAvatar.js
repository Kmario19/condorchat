/**
 * Verify if file type is accepted
 * Verify if file size is lower than 2MB
 */
const validateAvatar = (req, res, next) => {
    const allowedMimeTypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/x-png', 'image/png', 'image/svg+xml']

    if (req.files && Object.keys(req.files).length) {
        if (req.files.avatar && allowedMimeTypes.indexOf(req.files.avatar.mimetype) == -1)
            return res.status(422).json({ error: 'This file type is not allowed', field: 'avatar' })

        const maxSize = 2e+6 // 2Mb

        if (req.files.avatar && req.files.avatar.size > maxSize)
            return res.status(422).json({ error: `The maximum file size is ${maxSize / 1e+6}Mb`, field: 'avatar' })
    }

    next()
}

module.exports = validateAvatar