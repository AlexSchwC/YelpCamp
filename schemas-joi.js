const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string()
}).required();