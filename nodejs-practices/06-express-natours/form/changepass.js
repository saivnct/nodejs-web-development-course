const Joi = require("joi");

const changePassSchema = Joi.object({
  currentPassword: Joi.string().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!#$%&?@]{5,30}$')),
  repeatPassword: Joi.string().required().valid(Joi.ref('password')),
});

module.exports = changePassSchema;