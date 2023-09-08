const path = require('path'); // a node built-in to manipulate path name

const express = require('express');

//3rd-party middleware - HTTP request logger middleware
const morgan = require('morgan');

const app = express();


if (process.env.NODE_ENV === 'development') {
  // 1) 3RD-party MIDDLE WARE - HTTP request logger middleware
  app.use(morgan('dev'));
}


//using express.json middleware -> stand between req and response
//body json parser
app.use(express.json());

//body form parser (the way browser send data to server by form is called urlencoded)
app.use(express.urlencoded({
  extended: true,     //allow us to parse complex data
}));

const testRouter = require('./routes/test');
app.use('/test', testRouter); //use userRouter as a middleware for specific route '/api/v1/users'

module.exports = app;