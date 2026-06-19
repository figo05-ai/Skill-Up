const dotenv = require('dotenv');
dotenv.config();

// بيانات الاتصال متوافقة مع إعدادات الـ docker-compose
const host = 'database'; 
const database = 'skillup_db'; 
const username = 'devuser'; 
const password = 'devpassword'; 
const port = 3306;

const mysql = require('mysql2/promise');

const createDatabaseIfNotExists = async () => {
  try {
    const conn = await mysql.createConnection({ host, port, user: username, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await conn.end();
    console.log(`Ensured database exists: ${database}`);
  } catch (err) {
    console.error('Error ensuring database exists:', err.message);
    throw err;
  }
};

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = { sequelize, Sequelize, createDatabaseIfNotExists };
