const Joi = require("joi");

module.exports.serviceSchema = Joi.object({
    service: Joi.object({
        
        type: Joi.string().valid(
            "Catering",
            "Photography",
            "Decoration",
            "Venue",
            "Music/DJ",
            "Transport"
        ).required(),

        charges: Joi.number().min(0).required(),

        address: Joi.string().allow("", null),

        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .message("Phone number must be 10 digits")
            .allow("", null),

        keyFeatures: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string().allow("", null)
        ),

        events: Joi.array().items(
            Joi.string().hex().length(24)
        )

    }).required(),
});