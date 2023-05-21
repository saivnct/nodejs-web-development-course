class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);    // when a new object created by calling constructor function -> then that calling will not appear in the stack trace, and will not pollute it
    }
}

module.exports =  AppError;