/**
 * The Token JWT must be present
 */
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization

    if (typeof header !== 'undefined') {
        req.token = header.split(' ')[1]
        next()
    } else {
        res.status(401).json({ error: 'Unauthorized' })
    }
}

module.exports = verifyToken