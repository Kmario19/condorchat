const express = require('express')
const users = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose.connect('mongodb://localhost/condorchat', { useNewUrlParser: true })

const User = require('../models/user')

users.get('/', (req, res) => {
    User.find({}, 'first_name last_name username', (err, users) => {
        if (err) return res.status(400).json(err)

        return res.json(users)
    })
})

users.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, '-password', (err, user) => {
        if (err) return res.status(400).json(err)

        if (user && req.body.password && bcrypt.compareSync(req.body.password, user.password))
            return res.json(user)

        return res.status(404).json({ error: 'Username or password incorrect' })

    })
})

users.post('/register', (req, res) => {
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

            return res.json({ message: 'User created', user })
        })

    })
})

users.get('/:username', (req, res) => {
    User.findOne({ username: new RegExp(req.params.username, 'i') }, '-password', (err, user) => {
        if (err) return res.status(400).json(err)

        if (!user) return res.status(404).json({ error: 'User not found' })

        return res.json(user)

    })
})

module.exports = users