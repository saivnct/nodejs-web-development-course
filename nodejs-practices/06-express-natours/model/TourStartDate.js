const ModelSchemaValidator = require("../utils/ModelSchemaValidator");
const ModelSchema = require("../utils/ModelSchema");
const sql = require("mssql");

const TourStartDateSchema = new ModelSchema(
    {
        tourId: new ModelSchemaValidator({
            name: 'tourId',
            sqlType: sql.Int,
            require: true,
        }),
        date: new ModelSchemaValidator({
            name: 'date',
            sqlType: sql.DateTime,
            require: true,
        }),
    }, 'TourStartDate', 'tourId'
)
module.exports = TourStartDateSchema;