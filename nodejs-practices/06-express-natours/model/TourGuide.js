const ModelSchemaValidator = require("../utils/ModelSchemaValidator");
const ModelSchema = require("../utils/ModelSchema");
const sql = require("mssql");

const TourGuideSchema = new ModelSchema(
    {
        tourId: new ModelSchemaValidator({
          name: 'tourId',
          sqlType: sql.Int,
          require: true,
        }),
        userId: new ModelSchemaValidator({
          name: 'userId',
          sqlType: sql.Int,
          require: true,
        }),
    }, 'TourGuide', 'tourId'
)
module.exports = TourGuideSchema;