const StaticData = require("../utils/StaticData");
const ModelSchemaValidator = require("../utils/ModelSchemaValidator");
const ModelSchema = require("../utils/ModelSchema");
const sql = require("mssql");
const validator = require("validator");

const UserSchema = new ModelSchema(
    {
        id: new ModelSchemaValidator({
            name: 'id',
            sqlType: sql.Int,
        }),
        userName: new ModelSchemaValidator({
            name: 'userName',
            sqlType: sql.VarChar,
            require: true,
        }),
        email: new ModelSchemaValidator({
            name: 'email',
            sqlType: sql.VarChar,
            require: true,
            validator:  function (val) {
                return validator.isEmail(val);
            },
        }),
        name: new ModelSchemaValidator({
          name: 'name',
          sqlType: sql.VarChar,
          require: true,
        }),
        password: new ModelSchemaValidator({
            name: 'password',
            sqlType: sql.VarChar,
            require: true,
            validator:  function (val) {
                // console.log(val, val.length);
                return val.length > 5 && val.length < 200;
            },
        }),
        passwordAt: new ModelSchemaValidator({
            name: 'passwordAt',
            sqlType: sql.DateTime,
            require: true,
        }),
        photo: new ModelSchemaValidator({
            name: 'photo',
            sqlType: sql.VarChar,
            default: 'default.jpg',
        }),
        role: new ModelSchemaValidator({
            name: 'role',
            sqlType: sql.Int,
            default: StaticData.AUTH.Role.user,
            require: true,
        }),
        createdAt: new ModelSchemaValidator({
            name: 'createdAt',
            sqlType: sql.DateTime,
            require: true,
        }),
    }, 'Users', 'createdAt'
)
module.exports = UserSchema;