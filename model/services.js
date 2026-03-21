const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Service Schema
const serviceSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    charges: {
        type: Number
    },
    address: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    keyFeatures: [
        { type: String } // Array of strings for multiple features
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event' // This must exactly match the name of your Event model
        }
    ]
});
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service ;