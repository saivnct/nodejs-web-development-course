const Joi = require("joi");

const signupSchema = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!#$%&?@]{5,30}$')),
    repeatPassword: Joi.string().required().valid(Joi.ref('password')),
});

module.exports = signupSchema;