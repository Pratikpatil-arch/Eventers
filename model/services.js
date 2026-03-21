const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");

// Service Schema
const serviceSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    charges: {
        type: Number,
         min: 0,
         required: true,
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: String,
         required: true,
    },
    keyFeatures: [
        { type: String
         } // Array of strings for multiple features
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event' // This must exactly match the name of your Event model
        }
    ],
      reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
              ref: "Review",
        }
    ],
     owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
});

serviceSchema.post("findOneAndDelete", async (service) => {
    if (service && service.reviews.length > 0) {
        await Review.deleteMany({
            _id: { $in: service.reviews }
        });
    }
});

const Service = mongoose.model('Service', serviceSchema);



module.exports = Service ;