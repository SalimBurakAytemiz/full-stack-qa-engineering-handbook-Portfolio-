const path = require('node:path');

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'qa-demo.db'),
};

module.exports = config;
