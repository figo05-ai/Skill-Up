require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Employee = require('./models/User');
const Task = require('./models/Task');
const Attendance = require('./models/Attendance');

const seed = async () => {
  try {
    await connectDB();

    // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  // Use ADMIN_PASSWORD from env; if not present, create a randomized placeholder and log a warning
  const adminPasswordRaw = process.env.ADMIN_PASSWORD || null;
  if (!adminPasswordRaw) console.warn('WARNING: ADMIN_PASSWORD not set in .env — seeding will create an admin with a generated password. Change before production.');
    let admin = await Employee.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const raw = adminPasswordRaw || Math.random().toString(36).slice(-12);
      // Save raw password and let model pre-save hook hash it
      admin = await Employee.create({ name: 'Admin', email: adminEmail, password: raw, role: 'admin', allowLogin: true });
      await admin.save?.();
      console.log('Admin created:', adminEmail);
      if (!adminPasswordRaw) console.log('Admin generated password (change immediately):', raw);
    }

    // Sample staff
    // Sample staff - use hashed passwords and avoid obvious defaults
    const staffData = [
      { name: 'Alice', email: 'alice@example.com', password: Math.random().toString(36).slice(-10), department: 'Engineering' },
      { name: 'Bob', email: 'bob@example.com', password: Math.random().toString(36).slice(-10), department: 'Design' },
      { name: 'Charlie', email: 'charlie@example.com', password: Math.random().toString(36).slice(-10), department: 'Sales' },
    ];

    const staff = [];
    for (const s of staffData) {
      let u = await Employee.findOne({ where: { email: s.email } });
      if (!u) {
        const raw = s.password;
        // Save raw password and let model pre-save hook hash it
        u = await Employee.create({ name: s.name, email: s.email, password: raw, department: s.department });
        console.log('Created', s.email, 'password:', raw);
      }
      staff.push(u);
    }

    // Sample tasks
    const tasks = [
      { title: 'Implement Auth', description: 'JWT auth and RBAC', assignedTo: staff[0].id, status: 'in-progress', progressPercentage: 60, createdBy: admin.id },
      { title: 'Design Dashboard', description: 'Create charts and UI', assignedTo: staff[1].id, status: 'todo', progressPercentage: 0, createdBy: admin.id },
      { title: 'Reach out to clients', description: 'Contact leads', assignedTo: staff[2].id, status: 'todo', progressPercentage: 0, createdBy: admin.id },
    ];
    for (const t of tasks) {
      let tk = await Task.findOne({ where: { title: t.title } });
      if (!tk) { tk = await Task.create(t); console.log('Task created:', t.title); }
    }

    // Sample attendance (yesterday checkin/checkout)
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0);
    for (const s of staff) {
      const exists = await Attendance.findOne({ where: { userRef: s.id, date: yesterday } });
      if (!exists) {
        const inTime = new Date(yesterday.getTime() + 11*60*60*1000); // 11:00
        const outTime = new Date(yesterday.getTime() + 17*60*60*1000); // 17:00
        await Attendance.create({ userRef: s.id, checkIn: inTime, checkOut: outTime, date: yesterday, workHours: 6 });
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
