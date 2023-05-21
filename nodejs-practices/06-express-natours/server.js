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

const sql = require('mssql');
const dbConfig = require('./db/dbconfig');
const appPool = new sql.ConnectionPool(dbConfig.config);


// console.log(app.get('env'));
// console.log(process.env);

//https://www.npmjs.com/package/mssql#asyncawait => Global Pool Single Instance
appPool
    .connect()
    .then(function (pool) {
        // app.locals.db = pool;
        dbConfig.db.pool = pool;
        console.log('SQL Connected!');
    })
//if we dont catch err of this promise => it will go to UnHandled Promise Rejections
// .catch(function (err) {
//   console.error('Error creating db connection pool', err);
// });


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
        console.log('EXIT APP');
        process.exit(1); //code 0: success, 1: uncaught exception
    });

});

