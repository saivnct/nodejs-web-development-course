const dotenv = require('dotenv');


//Implement UNCAUGHT EXCEPTION
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION => Shutting down...');
    console.log(err.name, err.message);

    console.log('EXIT APP');
    process.exit(1); //code 0: success, 1: uncaught exception

});




dotenv.config({
  path: './config.env',
});

//NOTE: we need to move this line after dotenv.config => because we need to load env file first
const app = require('./app');

const db = require('./db/db');


// console.log(app.get('env'));
// console.log(process.env);


db.pool.connect().then(function (client) {
    console.log('Postgres Connected!');
});

//4) START SERVER
const PORT = process.env.PORT;
let server = app.listen(PORT, () => {
    console.log(`listening on ${PORT}...`);
});




//Implement UnHandled Promise Rejections
//if there's any Promise reject in Application that is not handled by catch() => goes to this event
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION => Shutting down...');
    console.log(err.name, err.message);


    //close express, finish all the requests
    server.close(() => {
        db.pool.end()

        console.log('EXIT APP');
        process.exit(1); //code 0: success, 1: uncaught exception
    });

});

