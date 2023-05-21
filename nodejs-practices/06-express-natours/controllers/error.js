const AppError = require('./../utils/appError');

const sendErrorDev = (err, req, res) => {
    console.log(err.stack); //show stack trace

    if (req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }else{
        res.status(err.statusCode)
          .render('error', {
              title: 'Something went wrong',
              message: err.message,
          });
    }


}
const sendErrorProduction = (err, req, res) => {
    //Programming or other unknown error: don't leak error details
    let statusCode = 500;
    let status = 'error';
    let message = 'Internal Error';

    if (err.isOperational){
        //Operational, trusted error: send message to client
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    }

    if (req.originalUrl.startsWith('/api')){
        res.status(statusCode).json({
            status: status,
            message: message,
        });
    }else{
        res.status(statusCode)
          .render('error', {
              title: 'Something went wrong',
              message: message,
          });
    }

}

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
    // console.log(err.stack); //show stack trace

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // console.log('err',err);

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    }else if (process.env.NODE_ENV === 'production'){
        let error = err;

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }else if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProduction(error, req, res);
    }


}