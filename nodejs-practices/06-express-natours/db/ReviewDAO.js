const dbconfig = require('./dbconfig');
const dbUtils = require('../utils/dbUtils')
const ReviewSchema = require('../model/Review');
const StaticData = require('../utils/StaticData');


exports.getAllReviews = async function(filter) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let query = `SELECT * from ${ReviewSchema.schemaName}`
  let countQuery = `SELECT COUNT(DISTINCT id) as totalItem from ${ReviewSchema.schemaName}`

  const page = filter.page * 1 || 1;
  let pageSize = filter.pageSize * 1 || StaticData.config.MAX_PAGE_SIZE;
  if (pageSize > StaticData.config.MAX_PAGE_SIZE) {
    pageSize = StaticData.config.MAX_PAGE_SIZE;
  }

  const {filterStr,paginationStr} = dbUtils.getFilterQuery(ReviewSchema.schema, filter,page ,pageSize, ReviewSchema.defaultSort);
  if (filterStr){
    query += ' ' + filterStr;
    countQuery += ' ' + filterStr;
  }

  if (paginationStr){
    query += ' ' + paginationStr;
  }

  // console.log(query);
  // console.log(countQuery);

  let result = await dbconfig.db.pool.request().query(query);

  let countResult = await dbconfig.db.pool.request().query(countQuery);

  // console.log(result);
  // console.log(countResult);

  let totalItem = 0;
  if (countResult.recordsets[0].length > 0) {
    totalItem = countResult.recordsets[0][0].totalItem;
  }
  let totalPage = Math.ceil(totalItem/pageSize); //round up
  // console.log(totalItem);
  // console.log(totalPage);


  return {
    page,
    pageSize,
    pageSize,
    totalPage,
    totalItem,
    reviews: result.recordsets[0]
  };
}

exports.getReview = async function(id) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }
  let result = await dbconfig.db.pool
      .request()
      .input('id', ReviewSchema.schema.id.sqlType, id)
      .query(`SELECT * from ${ReviewSchema.schemaName} where id = @id`);

  // console.log(result);

  if (result.recordsets[0].length > 0) {
    return result.recordsets[0][0];
  }

  return null;
}

exports.getReviewByTourAndUser = async function(tourId, userId) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }
  let result = await dbconfig.db.pool
      .request()
      .input('tourId', ReviewSchema.schema.tourId.sqlType, tourId)
      .input('userId', ReviewSchema.schema.userId.sqlType, userId)
      .query(`SELECT * from ${ReviewSchema.schemaName} where tourId = @tourId AND userId = @userId`);

  // console.log(result);

  if (result.recordsets[0].length > 0) {
    return result.recordsets[0][0];
  }

  return null;
}

exports.addReview = async function(review) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let now = new Date();
  review.createdAt = now.toISOString();

  let insertData = ReviewSchema.validateData(review);

  console.log(insertData);

  let query = `insert into ${ReviewSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(ReviewSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') values (' + insertValuesStr + ')';
  console.log(query);

  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}

exports.updateReview = async function(id, updateReview) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  if (!updateReview){
    throw new Error('Invalid update param');
  }

  let query = `update ${ReviewSchema.schemaName} set`;

  const {request,updateStr} = dbUtils.getUpdateQuery(ReviewSchema.schema, dbconfig.db.pool.request(), updateReview);
  if (!updateStr){
    throw new Error('Invalid update param');
  }

  request.input('id', ReviewSchema.schema.id.sqlType, id);
  query += ' ' + updateStr + ' where id = @id';

  console.log(query);

  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}

exports.deleteReview = async function(id) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool
      .request()
      .input('id', ReviewSchema.schema.id.sqlType, id)
      .query(`delete ${ReviewSchema.schemaName} where id = @id`);

  // console.log(result);
  return result.recordsets;
}

exports.clearAll = async function() {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  let result = await dbconfig.db.pool.request().query(`delete ${ReviewSchema.schemaName}`);

  // console.log(result);
  return result.recordsets;
}

exports.addReviewIfNotExisted = async function(review) {
  if (!dbconfig.db.pool) {
    throw new Error('Not connected to db');
  }

  review.createdAt = (new Date()).toISOString();

  let insertData = ReviewSchema.validateData(review);

  // console.log(insertData);

  let query = `SET IDENTITY_INSERT ${ReviewSchema.schemaName} ON insert into ${ReviewSchema.schemaName}`;

  const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(ReviewSchema.schema, dbconfig.db.pool.request(), insertData);
  if (!insertFieldNamesStr || !insertValuesStr){
    throw new Error('Invalid insert param');
  }

  query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
    ` WHERE NOT EXISTS(SELECT * FROM ${ReviewSchema.schemaName} WHERE ${ReviewSchema.schema.id.name} = @${ReviewSchema.schema.id.name})`;
  // console.log(query);

  let result = await request.query(query);

  // console.log(result);
  return result.recordsets;
}