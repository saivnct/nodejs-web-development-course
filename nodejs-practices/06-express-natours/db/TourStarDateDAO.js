const dbconfig = require('./dbconfig');
const TourStartDateSchema = require('../model/TourStartDate');
const dbUtils = require("../utils/dbUtils");

async function getByTourId(tourId) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool
    .request()
    .input('tourId', TourStartDateSchema.schema.tourId.sqlType, tourId)
    .query(`SELECT * from ${TourStartDateSchema.schemaName} where tourId = @tourId`);

  // console.log(result);
  return result.recordsets[0].map(x => x.date);
}

async function addTourStartDateIfNotExisted(tourStartDate) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let insertData = TourStartDateSchema.validateData(tourStartDate);

  let query = `insert into ${TourStartDateSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourStartDateSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
      ` WHERE NOT EXISTS(SELECT * FROM ${TourStartDateSchema.schemaName} WHERE tourId = @tourId AND date = @date)`;
  // console.log(query);


  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}

async function clearAll() {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool.request().query(`delete ${TourStartDateSchema.schemaName}`);

  // console.log(result);
  return result.recordsets;
}

module.exports = {
  getByTourId: getByTourId,
  addTourStartDateIfNotExisted: addTourStartDateIfNotExisted,
  clearAll: clearAll,
};
