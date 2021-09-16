const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    text: {
        type: String
    },
    time: {
        type: String
    }
});

const roomSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    message: [messageSchema]
});

module.exports = model('Room', roomSchema);

// room.message.push({text: '', time: ''});
// room.save(err => {});