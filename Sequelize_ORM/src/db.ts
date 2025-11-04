// src/db/sequelize.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

let sequelize: Sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Sequelize connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database via Sequelize:', err);
  });

export { sequelize, Sequelize };