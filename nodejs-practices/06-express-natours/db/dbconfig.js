const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  port: process.env.MSSQL_PORT*1 || 1433,
  database: process.env.MSSQL_DB,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

exports.config = config;
exports.db = {};
