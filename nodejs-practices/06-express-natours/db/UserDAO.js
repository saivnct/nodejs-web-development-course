const dbconfig = require('./dbconfig');
const dbUtils = require('../utils/dbUtils')
const UserSchema = require('../model/User');
const StaticData = require('../utils/StaticData');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async function(filter) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let query = `SELECT * from ${UserSchema.schemaName}`
    let countQuery = `SELECT COUNT(DISTINCT id) as totalItem from ${UserSchema.schemaName}`

    const page = filter.page * 1 || 1;
    let pageSize = filter.pageSize * 1 || StaticData.config.MAX_PAGE_SIZE;
    if (pageSize > StaticData.config.MAX_PAGE_SIZE) {
        pageSize = StaticData.config.MAX_PAGE_SIZE;
    }

    const {filterStr,paginationStr} = dbUtils.getFilterQuery(UserSchema.schema, filter,page ,pageSize, UserSchema.defaultSort);
    if (filterStr){
        query += ' ' + filterStr;
        countQuery += ' ' + filterStr;
    }

    if (paginationStr){
        query += ' ' + paginationStr;
    }

    console.log(query);
    console.log(countQuery);

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
        tours: result.recordsets[0]
    };
}

exports.getUser = async function(id) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }
    let result = await dbconfig.db.pool
        .request()
        .input('id', UserSchema.schema.id.sqlType, id)
        .query(`SELECT * from ${UserSchema.schemaName} where id = @id`);

    // console.log(result);

    if (result.recordsets[0].length > 0) {
        return result.recordsets[0][0];
    }

    return null;
}

exports.getUserByUserName = async function(userName) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    // Always use parameters or tagged template literals to pass sanitized values to your queries.
    let result = await dbconfig.db.pool
        .request()
        .input('userName', UserSchema.schema.userName.sqlType, userName)
        .query(`SELECT * from ${UserSchema.schemaName} where userName = @userName`);

    // console.log(result);

    if (result.recordsets[0].length > 0) {
        return result.recordsets[0][0];
    }

    return null;
}

exports.getUserByEmail = async function(email) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }
    let result = await dbconfig.db.pool
      .request()
      .input('email', UserSchema.schema.userName.sqlType, email)
      .query(`SELECT * from ${UserSchema.schemaName} where email = @email`);

    // console.log(result);

    if (result.recordsets[0].length > 0) {
        return result.recordsets[0][0];
    }

    return null;
}

exports.addUser = async function(user) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let now = (new Date()).toISOString();
    user.passwordAt = now;
    user.createdAt = now;
    // console.log('now',now);

    let insertData = UserSchema.validateData(user);
    console.log(insertData);

    //hash the password with hashing algorithm called bcrypt with cost of 10 => how CPU intensive this operation will be
    insertData.password = await bcrypt.hash(insertData.password, 10);


    let query = `insert into ${UserSchema.schemaName}`;

    const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(UserSchema.schema, dbconfig.db.pool.request(), insertData);
    if (!insertFieldNamesStr || !insertValuesStr){
        throw new Error('Invalid insert param');
    }

    query += ' (' + insertFieldNamesStr + ') values (' + insertValuesStr + ')';
    console.log(query);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}

exports.updateUser = async function(id, updateUser) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    if (!updateUser){
        throw new Error('Invalid update param');
    }

    if (updateUser.password){
        updateUser.password = await bcrypt.hash(updateUser.password, 10);
        const now = (new Date()).toISOString();
        updateUser.passwordAt = now;
    }

    let query = `update ${UserSchema.schemaName} set`;
    // 'update User set password = @password, photo = @photo where id = @id';

    const {request,updateStr} = dbUtils.getUpdateQuery(UserSchema.schema, dbconfig.db.pool.request(), updateUser);
    if (!updateStr){
        throw new Error('Invalid update param');
    }

    request.input('id', UserSchema.schema.id.sqlType, id);
    query += ' ' + updateStr + ' where id = @id';

    console.log(query);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}

exports.deleteUser = async function(id) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let result = await dbconfig.db.pool
        .request()
        .input('id', UserSchema.schema.id.sqlType, id)
        .query(`delete ${UserSchema.schemaName} where id = @id`);

    // console.log(result);
    return result.recordsets;
}

exports.clearAll = async function() {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let result = await dbconfig.db.pool.request().query(`delete ${UserSchema.schemaName}`);

    // console.log(result);
    return result.recordsets;
}

exports.addUserIfNotExisted = async function(user) {
    if (!dbconfig.db.pool) {
        throw new Error('Not connected to db');
    }

    let now = (new Date()).toISOString();
    user.passwordAt = now;
    user.createdAt = now;
    user.role = StaticData.AUTH.Role[user.role];
    if (!user.role){
        console.log(user);
        throw new Error('Invalid user role');
    }

    let insertData = UserSchema.validateData(user);
    //hash the password with cost of 12
    insertData.password = await bcrypt.hash(insertData.password, 10);

    // console.log(insertData);

    let query = `SET IDENTITY_INSERT ${UserSchema.schemaName} ON insert into ${UserSchema.schemaName}`;

    const {request, insertFieldNamesStr,insertValuesStr} = dbUtils.getInsertQuery(UserSchema.schema, dbconfig.db.pool.request(), insertData);
    if (!insertFieldNamesStr || !insertValuesStr){
        throw new Error('Invalid insert param');
    }

    query += ' (' + insertFieldNamesStr + ') select ' + insertValuesStr +
      ` WHERE NOT EXISTS(SELECT * FROM ${UserSchema.schemaName} WHERE ${UserSchema.schema.id.name} = @${UserSchema.schema.id.name}) ` +
      ` SET IDENTITY_INSERT ${UserSchema.schemaName} OFF`;
    // console.log(query);

    let result = await request.query(query);

    // console.log(result);
    return result.recordsets;
}