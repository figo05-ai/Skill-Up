const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const SystemLog = sequelize.define('SystemLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },
  performedBy: { type: DataTypes.STRING, allowNull: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'system_logs',
  timestamps: true
});

module.exports = SystemLog;