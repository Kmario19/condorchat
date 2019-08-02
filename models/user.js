const mongoose = require('mongoose')

let userShema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: Buffer,
    registered: { 
        type: Date,
        default: Date.now
    }
})

let User = mongoose.model('User', userShema)
 
module.exports = User