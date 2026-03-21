const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Event Schema
const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String // Usually stores the image URL or file path
    }
});


const Event = mongoose.model('Event', eventSchema);

module.exports =  Event ;