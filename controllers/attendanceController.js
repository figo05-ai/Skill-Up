const Attendance = require('../models/Attendance');

const Employee = require('../models/User');

const { Op } = require('sequelize');



const startOfDay = (d = new Date()) => {

  const dt = new Date(d);

  dt.setHours(0,0,0,0);

  return dt;

};



// This function is invalid because it tries to associate a Sequelize model with a Mongoose model.

// const ensureAssociation = () => { ... };



exports.checkIn = async (req, res) => {

  try {

    const userId = req.user.id;

    const today = startOfDay();

    let existing = await Attendance.findOne({ where: { userRef: userId, date: today } });

    if (existing && !existing.checkOut) return res.status(400).json({ message: 'Already checked in' });

    const att = await Attendance.create({ userRef: userId, checkIn: new Date(), date: today });

    res.status(201).json(att);

  } catch (err) {

    console.error('checkIn error:', err);

    res.status(500).json({ message: 'Server error', detail: err.message });

  }

};



exports.checkOut = async (req, res) => {

  try {

    const userId = req.user.id;

    const today = startOfDay();

    // Find a record for today that has NOT been checked out yet

    const att = await Attendance.findOne({ 

      where: {

        userRef: userId,

        date: today,

        checkOut: { [Op.is]: null }

      }

    });

    if (!att) return res.status(400).json({ message: 'No active check-in found' });

    att.checkOut = new Date();

    const ms = att.checkOut - att.checkIn;

    att.workHours = Math.round((ms / (1000*60*60)) * 100) / 100;

    await att.save();

    res.json(att);

  } catch (err) {

    console.error('checkOut error:', err);

    res.status(500).json({ message: 'Server error', detail: err.message });

  }

};



exports.history = async (req, res) => {

  try {

    if (!Attendance) throw new Error('Attendance model not loaded');

    const { userId, startDate, endDate } = req.query;

    const where = {};

    if (req.user.role === 'staff') where.userRef = req.user.id;

    else if (userId) where.userRef = userId;



    if (startDate && endDate) {

      const start = new Date(startDate);

      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999); // شمول اليوم الأخير بالكامل

      where.date = { [Op.gte]: start, [Op.lte]: end };

    }



    const attendanceRecords = await Attendance.findAll({ where, order: [['date','ASC']], raw: true });



    // Manually join user data from MongoDB

    const userIds = [...new Set(attendanceRecords.map(rec => rec.userRef).filter(Boolean))];

    if (userIds.length > 0) {

        const users = await Employee.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'email'], raw: true });

        const userMap = new Map(users.map(u => [u.id.toString(), u]));

        

        const results = attendanceRecords.map(rec => ({

            ...rec,

            user: userMap.get(String(rec.userRef)) || null

        }));

        return res.json(results);

    }

    res.json(attendanceRecords);

  } catch (err) {

    console.error('history error:', err);

    res.status(500).json({ message: 'Server error', detail: err.message });

  }

};



exports.seedAttendance = async (req, res) => {

  const { startDate, endDate } = req.body;

  const start = new Date(startDate);

  const end = new Date(endDate);

  

  try {

    const employees = await Employee.findAll(); 

    const attendanceRecords = [];



    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

      // Skip Friday (5) and Saturday (6)

      if (d.getDay() === 5 || d.getDay() === 6) continue;



      const dateStr = d.toISOString().split('T')[0];



      for (const emp of employees) {

         // استخدام Date.UTC لضمان التوقيت الصحيح (السعودية UTC+3) حيث 9 تعني 6 UTC
        const checkIn = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 6, Math.floor(Math.random() * 60), 0));


        const checkOut = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 14, Math.floor(Math.random() * 60), 0));



        const workHours = (checkOut - checkIn) / (1000 * 60 * 60);



        attendanceRecords.push({

          userRef: emp.id,

          date: dateStr,

          checkIn: checkIn,

          checkOut: checkOut,

          workHours: parseFloat(workHours.toFixed(2))

        });

      }

    }



    await Attendance.bulkCreate(attendanceRecords, { ignoreDuplicates: true });



    res.json({ message: `Generated ${attendanceRecords.length} records` });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: 'Seeding failed', error: error.message });

  }

};
