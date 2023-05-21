const path = require('path'); // a node built-in to manipulate path name

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

//3rd-party middleware - HTTP request logger middleware
const morgan = require('morgan');

//3rd-party middleware - Parse data from cookie
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/error');

const app = express();

//using template engine to render view to client
//express template engines:Pug, EJS, Handlebars
app.set('view engine', 'pug');
//define where views(templates) are located in file system
app.set('views', path.join(__dirname, 'views'));  //create a path by joining the dir name with '/views'
//using path because we dont know whether the path that we received somewhere has '/' or not



//using express.static middleware to serve static file
//http://localhost:8080/overview.html
// http://localhost:8080/img/pin.png
//how it work? => when we open a url that can't be found in any of our routes it will then look in puclic folder that we defined, and its set the public folder to the root
app.use(express.static(path.join(__dirname, 'public')));




//disable for mapbox to work
//Set security HTTP headers
// app.use(helmet())


if (process.env.NODE_ENV === 'development') {
  // 1) 3RD-party MIDDLE WARE - HTTP request logger middleware
  app.use(morgan('dev'));
}


//rate limit - middleware
//limit request from same IP - prevent denial of service and brute force attacks
//allow 100 requests from the same IP in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 *1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use(limiter);
// app.use('/api', limiter);  ///apply to only '/api' route




//using express.json middleware -> stand between req and response
//body json parser
app.use(express.json());

//body form parser (the way browser send data to server by form is called urlencoded)
app.use(express.urlencoded({
  extended: true,     //allow us to parse complex data
}));

//parse data from cookie
app.use(cookieParser());


//Data santitization against XSS - cross site scripting attack
//clean any user input from malicious HTML code by converting all HTML symbol
//an attacker try to insert some malicious HTML code with some Js code attached to it
// and that would then later be injected into our HTML site => it could be create some damage
app.use(xss());





//custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});


//method 3: mounting the router on a route
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const reviewRouter = require('./routes/review');
const viewRouter = require('./routes/view');

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); //use tourRouter as a middleware for specific route '/api/v1/tours'
app.use('/api/v1/users', userRouter); //use userRouter as a middleware for specific route '/api/v1/users'
app.use('/api/v1/reviews', reviewRouter); //use userRouter as a middleware for specific route '/api/v1/users'


//Handling unhandled routes (urls that not exist)
app.all('*', (req, res, next) => {
  //solution 2 - pass error to Global Error Handler Middleware
  // const err = new Error(`Can't find ${req.originalUrl} on this server`)
  // err.status = 'error';
  // err.statusCode = 404;

  //solution 3 - using Custom AppError
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404)


  next(err);  //if next() function receives an argument, no matter what it is, Express will automatically know that there was an error
  //express will assume that whatever we pass into next() function is an error
})


//Error handling middleware
app.use(globalErrorHandler);

module.exports = app;