const dbconfig = require('./dbconfig');
const dbUtils = require('../utils/dbUtils')
const TourLocationSchema = require('../model/TourLocation');
const LocationSchema = require('../model/Location');

exports.getByTourId = async function(tourId) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let query = `SELECT t.tourId, t.locationId, t.day, l.description, l.type, l.lat, l.lng, l.address` +
    ` from ${TourLocationSchema.schemaName} as t`+
    ` left join ${LocationSchema.schemaName} as l`+
    ` on t.locationId = l.id` +
    ` where t.tourId = @tourId` +
    ` ORDER BY t.day`;

  // console.log(query);

  let result = await dbconfig.db.pool
    .request()
    .input('tourId', TourLocationSchema.schema.tourId.sqlType, tourId)
    .query(query);

  // console.log(result);
  return result.recordsets[0].map(x => {
    return {
      locationId: x.locationId,
      day: x.day,
      description: x.description,
      type: x.type,
      lat: x.lat,
      lng: x.lng,
      address: x.address,
    }
  });
}


exports.clearAll = async function() {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool.request().query(`delete ${TourLocationSchema.schemaName}`);

  // console.log(result);
  return result.recordsets;
}

exports.addTourLocationIfNotExisted = async function(tourLocation ) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let insertData = TourLocationSchema.validateData(tourLocation);

  let query = `insert into ${TourLocationSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourLocationSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
    ` WHERE NOT EXISTS(SELECT * FROM ${TourLocationSchema.schemaName} WHERE tourId = @tourId AND locationId = @locationId)`;
  // console.log(query);

  //insert into TourLocation (tourId,locationId,day) select @tourId,@imgName,@day WHERE NOT EXISTS(SELECT * FROM TourLocation tourId = @tourId AND locationId = @locationId)


  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}