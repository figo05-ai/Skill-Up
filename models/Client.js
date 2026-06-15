const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

if (!sequelize) {
  throw new Error('Sequelize instance is missing in Client model');
}

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  personalId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  commercialRecord: {
    type: DataTypes.STRING,
    allowNull: true
  },
  laborOfficeNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;