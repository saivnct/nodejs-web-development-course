const dbconfig = require('./dbconfig');
const dbUtils = require('../utils/dbUtils')
const TourGuideSchema = require('../model/TourGuide');
const UserSchema = require('../model/User');

exports.getByTourId = async function(tourId) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let query = `SELECT t.tourId, t.userId, u.userName, u.email, u.name, u.photo, u.role` +
    ` from ${TourGuideSchema.schemaName} as t`+
    ` left join ${UserSchema.schemaName} as u`+
    ` on t.userId = u.id` +
    ` where t.tourId = @tourId`;

  // console.log(query);

  let result = await dbconfig.db.pool
    .request()
    .input('tourId', TourGuideSchema.schema.tourId.sqlType, tourId)
    .query(query);

  // console.log(result);
  return result.recordsets[0].map(x => {
        return {
          userId: x.userId,
          userName: x.userName,
          email: x.email,
          name: x.name,
          photo: x.photo,
          role: x.role
        }
  });
}

exports.clearAll = async function() {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool.request().query(`delete ${TourGuideSchema.schemaName}`);

  // console.log(result);
  return result.recordsets;
}

exports.addTourGuideIfNotExisted = async function(tourGuide ) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let insertData = TourGuideSchema.validateData(tourGuide);

  let query = `insert into ${TourGuideSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourGuideSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
    ` WHERE NOT EXISTS(SELECT * FROM ${TourGuideSchema.schemaName} WHERE tourId = @tourId AND userId = @userId)`;
  // console.log(query);

  //insert into TourGuide (tourId,userId) select @tourId,@userId WHERE NOT EXISTS(SELECT * FROM TourGuide tourId = @tourId AND userId = @userId)


  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}