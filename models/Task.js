const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  deadline: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('todo', 'in-progress', 'completed'), allowNull: false, defaultValue: 'todo' },
  progressPercentage: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { 
  timestamps: true, 
  tableName: 'tasks',
  indexes: [
    { fields: ['assignedTo'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Task;