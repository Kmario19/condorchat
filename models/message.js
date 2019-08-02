const mongoose = require('mongoose')

let messageShema = mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    user:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group' 
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    timestamp: Date
})

let Message = mongoose.model('Message', messageShema)
 
module.exports = Message