// backend/src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const Task = sequelize.define('Task', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  deadline: { type: DataTypes.DATE },
  priority: { type: DataTypes.INTEGER, defaultValue: 1 },
  category: { type: DataTypes.STRING, defaultValue: 'study' },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  scheduled_start: { type: DataTypes.DATE },
  scheduled_end: { type: DataTypes.DATE }
});

const RoutineLog = sequelize.define('RoutineLog', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  meta: { type: DataTypes.JSON }
});

module.exports = { sequelize, Task, RoutineLog };
