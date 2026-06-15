const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userRef: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  checkIn: { type: DataTypes.DATE, allowNull: false },
  checkOut: { type: DataTypes.DATE, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: false },
  workHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
}, { 
  timestamps: true, 
  tableName: 'attendances',
  indexes: [
    { fields: ['userRef'] },
    { fields: ['date'] }
  ]
});

module.exports = Attendance;