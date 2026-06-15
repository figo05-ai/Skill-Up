const Employee = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const { sequelize } = require('../config/sequelize');
const { fn, col } = require('sequelize');

exports.summary = async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const tasksCompleted = await Task.count({ where: { status: 'completed' } });
    const today = new Date(); today.setHours(0,0,0,0);
    const presentRows = await Attendance.findAll({ where: { date: today }, attributes: ['userRef'], group: ['userRef'] });
    const presentTodayCount = presentRows.length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentTodayCount / totalEmployees) * 100) : 0;

    const agg = await Task.findAll({ attributes: [[fn('AVG', col('progressPercentage')), 'avgProgress']] });
    const avgProgress = agg && agg[0] && agg[0].dataValues && agg[0].dataValues.avgProgress ? Math.round(agg[0].dataValues.avgProgress * 100) / 100 : 0;

    res.json({ totalEmployees, tasksCompleted, attendanceRate, avgProgress });
  } catch (err) {
    console.error('dashboard summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};