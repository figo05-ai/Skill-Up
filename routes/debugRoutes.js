const express = require('express');
const router = express.Router();
let Employee, Attendance;
try { Employee = require('../models/User'); } catch (e) {}
if (!Employee) try { Employee = require('../models').User; } catch(e) {}

try { Attendance = require('../models/Attendance'); } catch (e) {}
if (!Attendance) try { Attendance = require('../models').Attendance; } catch(e) {}

// Development-only: reset the admin user's password to the ADMIN_PASSWORD from env
router.post('/reset-admin', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') return res.status(403).json({ message: 'Forbidden' });

    const adminEmail = process.env.ADMIN_EMAIL;
    const newPass = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !newPass) return res.status(400).json({ message: 'ADMIN_EMAIL or ADMIN_PASSWORD not set' });

    let admin = await Employee.findOne({ email: adminEmail });
    if (!admin) {
      // create admin
      admin = new Employee({ name: 'Admin', email: adminEmail, password: newPass, role: 'admin', allowLogin: true });
      await admin.save();
      return res.json({ message: 'Admin created', email: adminEmail });
    }

    admin.password = newPass; // model pre-save will hash
    admin.allowLogin = true;
    await admin.save();
    return res.json({ message: 'Admin password reset', email: adminEmail });
  } catch (err) {
    console.error('reset-admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/seed', async (req, res) => {
  const { startDate, endDate, employeeId } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Missing dates' });
  }

  try {
    if (!Employee) throw new Error('Employee model not found');
    if (!Attendance) throw new Error('Attendance model not found');

    let employees = [];
    if (employeeId) {
      const emp = await Employee.findByPk(employeeId, { attributes: ['id'] });
      if (emp) employees.push(emp);
    } else {
      // جلب جميع الموظفين
      employees = await Employee.findAll({ attributes: ['id'] });
    }
    
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found' });
    }

    let current = new Date(startDate);
    const end = new Date(endDate);
    const records = [];

    // حلقة تكرارية لكل يوم في الفترة المحددة
    while (current <= end) {
      const day = current.getDay();
      // تخطي الجمعة (5) والسبت (6)
      if (day !== 5 && day !== 6) {
        const dateStr = current.toISOString().split('T')[0];
        
        for (const emp of employees) {
          // نسبة حضور 90%
          if (Math.random() > 0.1) {
            // توليد أوقات عشوائية
            // الدخول بين 9:00 و 9:30 صباحاً بتوقيت السعودية
            const inHour = 9 + Math.random() * 0.5; 
            // الخروج بين 17:00 و 17:30 مساءً (5:00 PM) بتوقيت السعودية
            const outHour = 17 + Math.random() * 0.5; 
            
            // ضبط التوقيت كـ UTC ليعادل توقيت السعودية (+3)
            const utcInHour = inHour - 3;
            const utcOutHour = outHour - 3;
            
            const checkIn = new Date(Date.UTC(
              current.getFullYear(), current.getMonth(), current.getDate(),
              Math.floor(utcInHour), Math.floor((utcInHour % 1) * 60), 0
            ));
            
            const checkOut = new Date(Date.UTC(
              current.getFullYear(), current.getMonth(), current.getDate(),
              Math.floor(utcOutHour), Math.floor((utcOutHour % 1) * 60), 0
            ));
            
            const workHours = (checkOut - checkIn) / (1000 * 60 * 60);

            records.push({
              userRef: emp.id,
              date: dateStr,
              checkIn: checkIn,
              checkOut: checkOut,
              workHours: parseFloat(workHours.toFixed(2)),
              status: 'present'
            });
          }
        }
      }
      // الانتقال لليوم التالي
      current.setDate(current.getDate() + 1);
    }

    if (records.length > 0) {
      await Attendance.bulkCreate(records);
    }

    res.json({ message: `تم توليد ${records.length} سجل حضور بنجاح.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'فشلت عملية التوليد', error: error.message });
  }
});

module.exports = router;
