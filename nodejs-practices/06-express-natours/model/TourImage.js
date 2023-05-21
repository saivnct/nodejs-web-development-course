const ModelSchemaValidator = require("../utils/ModelSchemaValidator");
const ModelSchema = require("../utils/ModelSchema");
const sql = require("mssql");

const TourImageSchema = new ModelSchema(
    {
        tourId: new ModelSchemaValidator({
            name: 'tourId',
            sqlType: sql.Int,
            require: true,
        }),
        imgName: new ModelSchemaValidator({
            name: 'imgName',
            sqlType: sql.VarChar,
            require: true,
        }),
    }, 'TourImage', 'tourId'
)
module.exports = TourImageSchema;