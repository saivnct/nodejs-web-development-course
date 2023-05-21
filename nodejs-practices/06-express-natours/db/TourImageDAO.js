const dbconfig = require('./dbconfig');
const TourImageSchema = require('../model/TourImage');
const dbUtils = require("../utils/dbUtils");

async function getByTourId(tourId) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool
    .request()
    .input('tourId', TourImageSchema.schema.tourId.sqlType, tourId)
    .query(`SELECT * from ${TourImageSchema.schemaName} where tourId = @tourId`);

  // console.log(result);
  return result.recordsets[0].map(x => x.imgName);
}

async function addTourImageIfNotExisted(tourImage) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let insertData = TourImageSchema.validateData(tourImage);

  let query = `insert into ${TourImageSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourImageSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
      ` WHERE NOT EXISTS(SELECT * FROM ${TourImageSchema.schemaName} WHERE tourId = @tourId AND imgName = @imgName)`;
  // console.log(query);

  //insert into TourImage (tourId,imgName) select @tourId,@imgName WHERE NOT EXISTS(SELECT * FROM TourImage tourId = @tourId AND imgName = @imgName)


  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}

async function clearAll() {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool.request().query(`delete ${TourImageSchema.schemaName}`);

  // console.log(result);
  return result.recordsets;
}

module.exports = {
  getByTourId: getByTourId,
  addTourImageIfNotExisted: addTourImageIfNotExisted,
  clearAll: clearAll,
};
