<<<<<<< HEAD
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// اكتب بيانات هوستنجر هنا مباشرة بين علامات التنصيص
const host = '127.0.0.1'; 
const database = 'u912731784_hrms';      // تأكد من الاسم من هوستنجر
const username = 'root';      // تأكد من اليوزر من هوستنجر
const password = '12345678'
=======
const dotenv = require('dotenv');
dotenv.config();

// بيانات الاتصال متوافقة مع إعدادات الـ docker-compose
const host = 'database'; 
const database = 'skillup_db'; 
const username = 'devuser'; 
const password = 'devpassword'; 
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
const port = 3306;

const mysql = require('mysql2/promise');

<<<<<<< HEAD
// ... باقي الكود زي ما هو

=======
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
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

<<<<<<< HEAD
=======
const { Sequelize } = require('sequelize');

>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
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
