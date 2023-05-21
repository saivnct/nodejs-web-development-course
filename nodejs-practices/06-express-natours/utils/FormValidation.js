const AppError = require("./AppError");

exports.validateForm = (formSchema, data) => {
    const validationResult = formSchema.validate(data);
    if (validationResult.error) {
        //400 - bad request
        throw new AppError(`Invalid Form - ${validationResult.error.message}`, 400);
    }
    const form = validationResult.value;
    return form;
}