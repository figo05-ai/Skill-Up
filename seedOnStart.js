require("dotenv").config();
const bcrypt = require("bcryptjs");
const Employee = require("./models/User");
const Task = require("./models/Task");
const Attendance = require("./models/Attendance");
const jobTasks = require("./config/jobTasks");


module.exports = async function seedOnStart() {
  try {
await Employee.sequelize.sync();
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPasswordRaw = process.env.ADMIN_PASSWORD || null;

    let admin = await Employee.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const raw = adminPasswordRaw || Math.random().toString(36).slice(-12);
      // Save raw password and let the model pre-save hook hash it
      admin = await Employee.create({
        name: "Admin",
        email: adminEmail,
        password: raw,
        role: "admin",
        allowLogin: true,
      });
      console.log("Admin created:", adminEmail);
      if (!adminPasswordRaw)
        console.log("Admin generated password (change immediately):", raw);
    } else {
      // Ensure admin has allowLogin = true
      admin.allowLogin = true;
      admin.role = "admin";
      await admin.save();
      console.log("Admin permissions updated:", adminEmail);
    }

    // Ensure Almaa@gmail.com is admin and can login
    const alama = await Employee.findOne({
      where: { email: "Almaa@gmail.com" },
    });
    if (alama) {
      alama.allowLogin = true;
      alama.role = "admin";
      await alama.save();
      console.log("Almaa@gmail.com permissions updated");
    }

    // Sample staff
    const staffData = [
      {
        name: "Alice",
        email: "alice@example.com",
        password: Math.random().toString(36).slice(-10),
        department: "Engineering",
      },
      {
        name: "Bob",
        email: "bob@example.com",
        password: Math.random().toString(36).slice(-10),
        department: "Design",
      },
      {
        name: "Charlie",
        email: "charlie@example.com",
        password: Math.random().toString(36).slice(-10),
        department: "Sales",
      },
    ];

    const staff = [];
    for (const s of staffData) {
      let u = await Employee.findOne({ where: { email: s.email } });
      if (!u) {
        const raw = s.password;
        // Save raw password and let model hook hash it
        u = await Employee.create({
          name: s.name,
          email: s.email,
          password: raw,
          department: s.department,
          allowLogin: true,
        });
        console.log("Created", s.email, "password:", raw);
      }
      staff.push(u);
    }

    // Seed tasks for all employees based on job title
    const allEmployees = await Employee.findAll();
    const currentYear = new Date().getFullYear();
    const adminUser = await Employee.findOne({ where: { role: "admin" } });
    const adminId = adminUser ? adminUser.id : 1;

    for (const emp of allEmployees) {
      const title = emp.jobTitle ? emp.jobTitle.trim() : "";
      if (title && jobTasks[title]) {
        const tasks = jobTasks[title];

        for (let i = 0; i < tasks.length; i++) {
          const taskTitle = tasks[i];

          // Check if task exists
          const existingTask = await Task.findOne({
            where: {
              assignedTo: emp.id,
              title: taskTitle,
            },
          });

          if (!existingTask) {
            // Distribute 5 tasks across the year (approx every 2.4 months)
            // توزيع المهام لتغطي السنة بالكامل (من شهر 0 يناير إلى 11 ديسمبر)
            const month = Math.floor((i * 12) / tasks.length);
            const day = Math.floor(Math.random() * 28) + 1;
            const date = new Date(currentYear, month, day);

            // Random status logic
            const now = new Date();
            let status = "todo";
            let progress = 0;

            if (date < now) {
              // If task is older than 45 days, mark as completed
              const diffTime = Math.abs(now - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 45) {
                status = "completed";
                progress = 100;
              } else {
                status = "in-progress";
                progress = 50;
              }
            }

            await Task.create({
              title: taskTitle,
              description: taskTitle,
              assignedTo: emp.id,
              status: status,
              progressPercentage: progress,
              createdBy: adminId,
              createdAt: date,
              updatedAt: date,
            });
            console.log(`Seeded task for ${emp.name}: ${taskTitle}`);
          }
        }
      }
    }

    // Sample tasks
    const tasks = [
      {
        title: "Implement Auth",
        description: "JWT auth and RBAC",
        assignedTo: staff[0].id,
        status: "in-progress",
        progressPercentage: 60,
        createdBy: admin.id,
      },
      {
        title: "Design Dashboard",
        description: "Create charts and UI",
        assignedTo: staff[1].id,
        status: "todo",
        progressPercentage: 0,
        createdBy: admin.id,
      },
      {
        title: "Reach out to clients",
        description: "Contact leads",
        assignedTo: staff[2].id,
        status: "todo",
        progressPercentage: 0,
        createdBy: admin.id,
      },
    ];
    for (const t of tasks) {
      let tk = await Task.findOne({ where: { title: t.title } });
      if (!tk) {
        tk = await Task.create(t);
        console.log("Task created:", t.title);
      }
    }

    // Sample attendance
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    for (const s of staff) {
      const exists = await Attendance.findOne({
        where: { userRef: s.id, date: yesterday },
      });
      if (!exists) {
        const inTime = new Date(yesterday.getTime() + 11 * 60 * 60 * 1000);
        const outTime = new Date(yesterday.getTime() + 17 * 60 * 60 * 1000);
        await Attendance.create({
          userRef: s.id,
          checkIn: inTime,
          checkOut: outTime,
          date: yesterday,
          workHours: 6,
        });
      }
    }

    console.log("Startup seeding finished");
  } catch (err) {
    console.error("seedOnStart error:", err);
    throw err;
  }
};
