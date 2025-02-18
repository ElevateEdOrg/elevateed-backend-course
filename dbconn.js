require('dotenv').config();
const { Sequelize , DataTypes } = require('sequelize');


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST, // e.g., 'localhost'
  dialect: 'postgres',
  port:process.env.DB_PORT,       
  logging: false,             // set to true to see SQL queries logged in console
  pool: {
    max: 5,                   // maximum number of connections in pool
    min: 0,                   // minimum number of connections in pool
    acquire: 30000,           // maximum time in ms that pool will try to get connection before throwing error
    idle: 10000               // maximum time in ms that a connection can be idle before being released
  }
});

// Import model definitions
const Customer = require('./models/customers')(sequelize, DataTypes);
const Product = require('./models/products')(sequelize, DataTypes);
const Order = require('./models/orders')(sequelize, DataTypes);
const OrderItem = require('./models/orderitems')(sequelize, DataTypes);
const Payment = require('./models/payments')(sequelize, DataTypes);

module.exports = {sequelize,Customer,Product,Order,OrderItem,Payment};
