const { sequelize, createDatabaseIfNotExists } = require('./sequelize');

const connectDB = async () => {
  try {
    // Connect to MySQL
    if (process.env.NODE_ENV === 'development') {
      await createDatabaseIfNotExists();
    }

    await sequelize.authenticate();
    console.log('MySQL (Sequelize) connected');

    // Fix: Ensure 'address' column exists in clients table if table exists
    try {
      const [tableExists] = await sequelize.query("SHOW TABLES LIKE 'clients'");
      if (tableExists.length > 0) {
        const [columns] = await sequelize.query("SHOW COLUMNS FROM clients LIKE 'address'");
        if (columns.length === 0) {
          await sequelize.query("ALTER TABLE clients ADD COLUMN address VARCHAR(255) NULL");
          console.log('Fixed: Added missing "address" column to clients table');
        }
      }
    } catch (e) {
      console.warn('Auto-fix for address column failed:', e.message);
    }

    if (process.env.NODE_ENV === 'development') {
      // Pre-sync data fix: Ensure no NULLs exist in columns that are about to become NOT NULL
      // This prevents "Invalid use of NULL value" error during migration
      try {
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'employees'");
        if (tables.length > 0) {
          const updates = [
            "UPDATE employees SET personalEmail = '' WHERE personalEmail IS NULL",
            "UPDATE employees SET phone = '' WHERE phone IS NULL",
            "UPDATE employees SET jobTitle = '' WHERE jobTitle IS NULL",
            "UPDATE employees SET nationality = '' WHERE nationality IS NULL",
            "UPDATE employees SET department = '' WHERE department IS NULL",
            "UPDATE employees SET name = 'Unknown' WHERE name IS NULL",
            "UPDATE employees SET password = 'temp' WHERE password IS NULL",
            "DELETE FROM employees WHERE email IS NULL"
          ];
          for (const query of updates) {
            await sequelize.query(query);
          }
          console.log('Sanitized existing NULL values in employees table');

          // Fix: Explicitly update ENUM columns that might not be updated by sync({ alter: true })
          try {
             await sequelize.query("ALTER TABLE employees MODIFY COLUMN role ENUM('admin', 'staff', 'system_user') DEFAULT 'staff'");
             console.log('Updated employees role ENUM definition');
          } catch (e) {
             console.warn('ENUM update warning:', e.message);
          }
        }

        // Check and sanitize clients table if it exists
        const [clientTables] = await sequelize.query("SHOW TABLES LIKE 'clients'");
        if (clientTables.length > 0) {
          const clientUpdates = [
            "UPDATE clients SET name = 'Unknown' WHERE name IS NULL",
            "UPDATE clients SET email = '' WHERE email IS NULL",
            "UPDATE clients SET phone = '' WHERE phone IS NULL",
            "UPDATE clients SET personalId = '' WHERE personalId IS NULL",
            "UPDATE clients SET commercialRecord = '' WHERE commercialRecord IS NULL",
            "UPDATE clients SET laborOfficeNumber = '' WHERE laborOfficeNumber IS NULL"
          ];
          for (const query of clientUpdates) {
            await sequelize.query(query);
          }
          console.log('Sanitized existing NULL values in clients table');
        }
      } catch (warn) {
        console.warn('⚠️ Warning during data sanitization:', warn.message);
      }

      try {
        await sequelize.sync({ alter: true });
        console.log('Sequelize models synchronized (alter:true)');
        
        // Force specific users to be admins and allow login
        const [results] = await sequelize.query("UPDATE employees SET allowLogin = 1, role = 'admin' WHERE email IN ('admin@example.com', 'Alama@gmail.com')");
        console.log(`Forced admin permissions for ${results ? (results.affectedRows || results.changedRows) : '?'} rows.`);

        // Ensure all admins can login
        await sequelize.query("UPDATE employees SET allowLogin = 1 WHERE role = 'admin'");
        
        // Cleanup: Set client to NULL for employees linked to non-existent clients
        await sequelize.query("UPDATE employees SET client = NULL WHERE client IS NOT NULL AND client NOT IN (SELECT id FROM clients)");
        console.log('Cleaned up dangling client references in employees table');

      } catch (syncErr) {
        if (syncErr.message && syncErr.message.includes('Too many keys')) {
          console.warn('⚠️ Warning: "Too many keys" error detected. Falling back to basic sync (no alter). Please check your database indexes.');
          await sequelize.sync();
        } else {
          throw syncErr;
        }
      }
    }
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;