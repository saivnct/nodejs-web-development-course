const dbconfig = require('./dbconfig');
const dbUtils = require('../utils/dbUtils')
const StaticData = require('../utils/StaticData')
const TourSchema = require('../model/Tour');

const TourGuideDAO = require('./TourGuideDAO');
const TourImageDAO = require('./TourImageDAO');
const TourStarDateDAO = require('./TourStarDateDAO');
const TourLocationDAO = require('./TourLocationDAO');


async function getTourDetail(tour){
    if (!tour){
        return
    }

    const tourGuides = await TourGuideDAO.getByTourId(tour.id);
    tour.guides = tourGuides;

    const tourImages = await TourImageDAO.getByTourId(tour.id);
    tour.images = tourImages;

    const tourStarDates = await TourStarDateDAO.getByTourId(tour.id);
    tour.startDates = tourStarDates;


    const tourLocations = await TourLocationDAO.getByTourId(tour.id);
    tour.locations = tourLocations;

    return tour;
}

// https://github.com/tediousjs/node-mssql
async function getAllTours(filter) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let query = `SELECT * from ${TourSchema.schemaName}`
    let countQuery = `SELECT COUNT(DISTINCT id) as totalItem from ${TourSchema.schemaName}`

    const page = filter.page * 1 || 1;
    let pageSize = filter.pageSize * 1 || StaticData.config.MAX_PAGE_SIZE;
    if (pageSize > StaticData.config.MAX_PAGE_SIZE) {
        pageSize = StaticData.config.MAX_PAGE_SIZE;
    }

    const {filterStr,paginationStr} = dbUtils.getFilterQuery(TourSchema.schema, filter,page ,pageSize, TourSchema.defaultSort);
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

    const toursPromises = result.recordsets[0].map(async t => await getTourDetail(t));
    // console.log(toursPromises);
    const tours = await Promise.all(toursPromises);

    return {
        page,
        pageSize,
        totalPage,
        totalItem,
        tours: tours
    };
}


async function getTour(id) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }
    let result = await dbconfig.db.pool
        .request()
        .input('id', TourSchema.schema.id.sqlType, id)
        .query(`SELECT * from ${TourSchema.schemaName} where id = @id`);

    // console.log(result);

    if (result.recordsets[0].length > 0) {
        const tour = await getTourDetail(result.recordsets[0][0]);
        return tour;
    }

    return null;
}

async function getTourByName(name) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }
    let result = await dbconfig.db.pool
        .request()
        .input('name', TourSchema.schema.name.sqlType, name)
        .query(`SELECT * from ${TourSchema.schemaName} where name = @name`);

    // console.log(result);

    if (result.recordsets[0].length > 0) {
        return result.recordsets[0][0];
    }

    return null;
}

async function addTour(tour) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let now = new Date();
    tour.createdAt = now.toISOString();

    let insertData = TourSchema.validateData(tour);

    // let result = await dbconfig.db.pool
    //   .request()
    //   .input('name', sql.VarChar, data.name)
    //     .input('duration', sql.Int, data.duration)
    //     .input('maxGroupSize', sql.Int, data.maxGroupSize)
    //     .input('difficulty', sql.VarChar, data.difficulty)
    //     .input('ratingsAverage', sql.Float, data.ratingsAverage)
    //     .input('ratingsQuantity', sql.Int, data.ratingsQuantity)
    //     .input('price', sql.Int, data.price)
    //     .input('priceDiscount', sql.Int, data.priceDiscount)
    //     .input('summary', sql.VarChar, data.summary)
    //     .input('description', sql.VarChar, data.description)
    //     .input('imageCover', sql.VarChar, data.imageCover)
    //     .input('createdAt', sql.DateTime, now.toISOString())
    //
    //   .query(
    //     'insert into Tour (name, duration, maxGroupSize, difficulty, ratingsAverage, ratingsQuantity, price, priceDiscount, summary, description, imageCover, createdAt) ' +
    //       'values (@name,@duration,@maxGroupSize,@difficulty,@ratingsAverage,@ratingsQuantity,@price,@priceDiscount,@summary,@description,@imageCover, @createdAt)'
    //   );
    // console.log(result);


    console.log(insertData);


    let query = `insert into ${TourSchema.schemaName}`;

    const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourSchema.schema, dbconfig.db.pool.request(), insertData);
    if (!insertFieldNamesStr || !insertValuesStr){
        throw new Error('Invalid insert param');
    }

    query += ' (' + insertFieldNamesStr + ') values (' + insertValuesStr + ')';
    console.log(query);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}

async function updateTour(id, updateTour) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    if (!updateTour){
        throw new Error('Invalid update param');
    }

    let query = `update ${TourSchema.schemaName} set`;
    // 'update Tour set name = @name, ratingsAverage = @ratingsAverage, price = @price where id = @id';

    const {request,updateStr} = dbUtils.getUpdateQuery(TourSchema.schema, dbconfig.db.pool.request(), updateTour);
    if (!updateStr){
        throw new Error('Invalid update param');
    }

    request.input('id', TourSchema.schema.id.sqlType, id);
    query += ' ' + updateStr + ' where id = @id';

    console.log(query);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}


async function deleteTour(id) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let result = await dbconfig.db.pool
        .request()
        .input('id', TourSchema.schema.id.sqlType, id)
        .query(`delete ${TourSchema.schemaName} where id = @id`);

    // console.log(result);
    return result.recordsets;
}


async function clearAll() {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let result = await dbconfig.db.pool.request().query(`delete ${TourSchema.schemaName}`);

    // console.log(result);
    return result.recordsets;
}

async function addTourIfNotExisted(tour) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let now = new Date();
    tour.createdAt = now.toISOString();

    let insertData = TourSchema.validateData(tour);

    // console.log(insertData);

    let query = `SET IDENTITY_INSERT ${TourSchema.schemaName} ON insert into ${TourSchema.schemaName}`;

    const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(TourSchema.schema, dbconfig.db.pool.request(), insertData);
    if (!insertFieldNamesStr || !insertValuesStr){
        throw new Error('Invalid insert param');
    }

    query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
        ` WHERE NOT EXISTS(SELECT * FROM ${TourSchema.schemaName} WHERE name = @name)` +
        ` SET IDENTITY_INSERT ${TourSchema.schemaName} OFF`;
    // console.log(query);


    // let result = await dbconfig.db.pool
    //     .request()
    //     .input('name', sql.VarChar, tour.name)
    //     .input('duration', sql.Int, tour.duration)
    //     .input('maxGroupSize', sql.Int, tour.maxGroupSize)
    //     .input('difficulty', sql.VarChar, tour.difficulty)
    //     .input('ratingsAverage', sql.Float, tour.ratingsAverage)
    //     .input('ratingsQuantity', sql.Int, tour.ratingsQuantity)
    //     .input('price', sql.Int, tour.price)
    //     .input('summary', sql.VarChar, tour.summary)
    //     .input('description', sql.VarChar, tour.description)
    //     .input('imageCover', sql.VarChar, tour.imageCover)
    //     .query(
    //         'insert into Tour ' +
    //         '(name, duration, maxGroupSize, difficulty, ratingsAverage, ratingsQuantity, price, summary, description, imageCover)' +
    //         ' select @name, @duration, @maxGroupSize, @difficulty, @ratingsAverage, @ratingsQuantity ,@price, @summary, @description, @imageCover' +
    //         ' WHERE NOT EXISTS(SELECT * FROM Tour WHERE name = @name)'
    //     );
    // console.log(result);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}

module.exports = {
    getAllTours: getAllTours,
    getTour: getTour,
    getTourDetail: getTourDetail,
    getTourByName: getTourByName,
    addTour: addTour,
    updateTour: updateTour,
    deleteTour: deleteTour,
    clearAll: clearAll,
    addTourIfNotExisted: addTourIfNotExisted,
};