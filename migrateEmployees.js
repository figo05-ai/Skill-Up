require('dotenv').config();
const connectDB = require('./config/db');
const Employee = require('./models/User');

const migrate = async () => {
  try {
    await connectDB();
    console.log('Connected. Running migration: convert role "employee" -> "staff" and map designation -> department');

    const cursor = Employee.find({ $or: [{ role: 'employee' }, { designation: { $exists: true } }] }).cursor();
    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      if (doc.role === 'employee') doc.role = 'staff';
      if (!doc.department && doc.designation) doc.department = doc.designation;
      await doc.save();
      count++;
    }

    console.log(`Migration complete. Updated ${count} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();