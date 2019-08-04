const express = require('express')
const auth = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const global = require('../global')

const registerToken = (id) => jwt.sign({ userId: id }, global.TOKEN_KEY, { expiresIn: '24h' })

auth.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, '_id password', (err, user) => {
        if (err) return res.status(400).json(err)

        if (user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
            return res.json({ message: 'Logged in successfully', token: registerToken(user._id) })
        }

        return res.status(404).json({ error: 'Username or password incorrect' })

    })
})

auth.post('/register', (req, res) => {
    let userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: req.body.password
    }

    User.findOne({ username: userData.username }, '_id', (err, obj) => {
        if (err) return res.status(400).json(err)

        if (obj) return res.json({ error: 'User already exists' })

        userData.password = bcrypt.hashSync(userData.password, 10)

        let user = new User(userData)

        user.save((err, user) => {
            if (err) return res.status(400).json(err)

            return res.json({ message: 'User created', token: registerToken(user._id) })
        })

    })
})

module.exports = auth