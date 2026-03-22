// models/booking.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    services: [
        {
            type: Schema.Types.ObjectId,
            ref: "Service",
        },
    ],

    serviceOwners: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    totalPrice: {   //  NEW FIELD
        type: Number,
        required: true,
    },

    bookingDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", bookingSchema);