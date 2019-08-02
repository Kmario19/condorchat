const mongoose = require('mongoose')

let groupShema = congoose.Schema({
    name: {
        type: String,
        required: true
    },
    created: { 
        type: Date,
        default: Date.now
    }
})

let Group = mongoose.model('Group', groupShema)
 
module.exports = Group