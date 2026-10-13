const path = require('path');
const net = require('net');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;

class IPv4Socket extends net.Socket {
  connect(port, host) {
    return super.connect({ port, host, family: 4 });
  }
}

const databaseOptions = {
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  ...(databaseUrl && { dialectOptions: { stream: () => new IPv4Socket() } }),
  pool: {
    max: Number(process.env.DB_POOL_MAX || 5),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
    idle: Number(process.env.DB_POOL_IDLE || 10000)
  }
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, databaseOptions)
  : new Sequelize(
      process.env.DB_NAME || process.env.DB_DATABASE || 'kazimili_care',
      process.env.DB_USER || process.env.DB_USERNAME || 'mordern_developer',
      process.env.DB_PASSWORD || 'Cive@2004',
      {
        ...databaseOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432)
      }
    );

module.exports = sequelize;
