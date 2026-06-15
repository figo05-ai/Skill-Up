const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// اكتب بيانات هوستنجر هنا مباشرة بين علامات التنصيص
const host = '127.0.0.1'; 
const database = 'u912731784_hrms';      // تأكد من الاسم من هوستنجر
const username = 'root';      // تأكد من اليوزر من هوستنجر
const password = '12345678'
const port = 3306;

const mysql = require('mysql2/promise');

// ... باقي الكود زي ما هو

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
