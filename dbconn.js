require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST, // e.g., 'localhost'
  dialect: 'postgres',
  port: process.env.DB_PORT,
  logging: false,             // set to true to see SQL queries logged in console
  pool: {
    max: 5,                   // maximum number of connections in pool
    min: 0,                   // minimum number of connections in pool
    acquire: 30000,           // maximum time in ms that pool will try to get connection before throwing error
    idle: 10000               // maximum time in ms that a connection can be idle before being released
  }
});

const db = {};

db.User = require('./models/userModel')(sequelize, DataTypes);
db.Course = require('./models/courseModel')(sequelize, DataTypes);
db.Enrollment = require('./models/enrollmentModel')(sequelize, DataTypes);
db.Payment = require('./models/payementModel')(sequelize, DataTypes);
db.Lecture = require('./models/lectureModel')(sequelize, DataTypes);
db.Category = require('./models/categoryModel')(sequelize, DataTypes);
db.LectureStatus = require('./models/lectureStatusModel')(sequelize, DataTypes);

// Call associate methods after defining all models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = { db, sequelize };
