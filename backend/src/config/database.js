const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'travel_aggregator',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5435,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000
    }
  }
);

module.exports = sequelize;
