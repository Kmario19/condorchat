const mongoose = require('mongoose')

let groupShema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{
        body: {
            type: String,
            required: true
        },
        user:  { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    }],
    user:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    created: { 
        type: Date,
        default: Date.now
    }
})

let Group = mongoose.model('Group', groupShema)
 
module.exports = Group