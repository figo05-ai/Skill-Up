const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
<<<<<<< HEAD
const {
  isPrivilegedRole,
  serializeEmployee,
  serializeEmployees,
} = require('../utils/employeeSerializer');
const { NON_NEGATIVE_EMPLOYEE_FIELDS } = require('../middleware/validationMiddleware');

const privileged = (req) => isPrivilegedRole(req.user?.role);

const rejectNegativeEmployeeFields = (payload) => {
  for (const field of NON_NEGATIVE_EMPLOYEE_FIELDS) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      continue;
    }
    const value = Number(payload[field]);
    if (!Number.isFinite(value) || value < 0) {
      return `${field} must be greater than or equal to 0`;
    }
  }
  return null;
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { role: 'staff' },
      attributes: { exclude: ['password'] },
    });
    res.json(serializeEmployees(employees, { privileged: privileged(req) }));
=======

exports.getEmployees = async (req, res) => {
  try {
    // list staff members (role 'staff')
    const employees = await User.findAll({ where: { role: 'staff' }, attributes: { exclude: ['password'] } });
    res.json(employees);
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
<<<<<<< HEAD
    const employee = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(serializeEmployee(employee, { privileged: privileged(req) }));
=======
    const employee = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
<<<<<<< HEAD
    const negativeFieldError = rejectNegativeEmployeeFields(req.body);
    if (negativeFieldError) {
      return res.status(400).json({
        status: 'Error',
        message: negativeFieldError,
      });
    }

    const {
      name,
      email,
      personalEmail,
      phone,
      password,
      jobTitle,
      nationality,
      joiningDate,
      department,
      role,
      status,
      attendancePercentage,
      client,
      identityNumber,
      holidays,
      monthlyWorkHours,
    } = req.body;

    let existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const newEmp = await User.create({
      name,
      email,
      personalEmail,
      phone,
      password,
=======
    const { name, email, personalEmail, phone, password, jobTitle, nationality, joiningDate, department, role, status, attendancePercentage, client, identityNumber, holidays, monthlyWorkHours } = req.body;
    let existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const newEmp = await User.create({ 
      name, 
      email, 
      personalEmail,
      phone,
      password, 
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
      identityNumber,
      jobTitle,
      nationality,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
<<<<<<< HEAD
      role: role || 'staff',
      department,
      status: status || 'active',
      attendancePercentage: attendancePercentage ?? 0,
      client: client || null,
      holidays: holidays ?? 8,
      monthlyWorkHours: monthlyWorkHours ?? 176,
=======
      role: role || 'staff', 
      department,
      status: status || 'active',
      attendancePercentage: attendancePercentage || 0,
      client: client || null,
      holidays: holidays || 8,
      monthlyWorkHours: monthlyWorkHours || 176
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    });
    const emp = await User.findByPk(newEmp.id, { attributes: { exclude: ['password'] } });

    await SystemLog.create({
      action: 'CREATE_EMPLOYEE',
      details: `Created employee: ${name} (${email})`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
<<<<<<< HEAD
      ipAddress: req.ip,
    }).catch(console.error);

    res.status(201).json({
      message: 'Employee created',
      employee: serializeEmployee(emp, { privileged: true }),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'Error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
=======
      ipAddress: req.ip
    }).catch(console.error);

    res.status(201).json({ message: 'Employee created', employee: emp });
  } catch (error) {
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
<<<<<<< HEAD
    const negativeFieldError = rejectNegativeEmployeeFields(req.body);
    if (negativeFieldError) {
      return res.status(400).json({
        status: 'Error',
        message: negativeFieldError,
      });
    }

    const updates = req.body;
    const allowed = [
      'name',
      'email',
      'personalEmail',
      'phone',
      'jobTitle',
      'nationality',
      'joiningDate',
      'department',
      'role',
      'password',
      'status',
      'attendancePercentage',
      'client',
      'identityNumber',
      'holidays',
      'monthlyWorkHours',
      'allowLogin',
    ];
=======
    const updates = req.body;
    const allowed = ['name', 'email', 'personalEmail', 'phone', 'jobTitle', 'nationality', 'joiningDate', 'department', 'role', 'password', 'status', 'attendancePercentage', 'client', 'identityNumber', 'holidays', 'monthlyWorkHours', 'allowLogin'];
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3

    const employee = await User.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const previousAllowLogin = employee.allowLogin;

    Object.keys(updates).forEach((key) => {
      if (allowed.includes(key)) {
        if (key === 'joiningDate' && updates[key]) {
          employee[key] = new Date(updates[key]);
        } else {
          employee[key] = updates[key];
        }
      }
    });

    await employee.save();
    const updated = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

<<<<<<< HEAD
=======
    // تسجيل عملية تفعيل/تعطيل الحساب بشكل منفصل
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    if (updates.allowLogin !== undefined && updates.allowLogin !== previousAllowLogin) {
      await SystemLog.create({
        action: updates.allowLogin ? 'ENABLE_USER' : 'DISABLE_USER',
        details: `${updates.allowLogin ? 'Enabled' : 'Disabled'} account for: ${employee.name} (${employee.email})`,
        performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
        userId: req.user ? req.user.id : null,
<<<<<<< HEAD
        ipAddress: req.ip,
=======
        ipAddress: req.ip
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
      }).catch(console.error);
    }

    await SystemLog.create({
      action: 'UPDATE_EMPLOYEE',
      details: `Updated employee: ${employee.name}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
<<<<<<< HEAD
      ipAddress: req.ip,
    }).catch(console.error);

    res.json({
      message: 'Employee updated',
      employee: serializeEmployee(updated, { privileged: true }),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'Error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
=======
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ message: 'Employee updated', employee: updated });
  } catch (error) {
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const empName = employee.name;
    await employee.destroy();

    await SystemLog.create({
      action: 'DELETE_EMPLOYEE',
      details: `Deleted employee: ${empName}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
<<<<<<< HEAD
      ipAddress: req.ip,
=======
      ipAddress: req.ip
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    }).catch(console.error);

    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.bulkCreateEmployees = async (req, res) => {
  try {
    const employees = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ message: 'Input must be an array of employees' });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const empData of employees) {
      try {
        if (!empData.email || !empData.password || !empData.name) {
          throw new Error('Missing required fields (name, email, password)');
        }
<<<<<<< HEAD
        const negativeError = rejectNegativeEmployeeFields(empData);
        if (negativeError) throw new Error(negativeError);

=======
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
        const existing = await User.findOne({ where: { email: empData.email } });
        if (existing) throw new Error('Email already exists');

        const newEmp = User.build({ ...empData, role: empData.role || 'staff' });
        await newEmp.save();
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ email: empData.email, error: err.message });
      }
    }

    await SystemLog.create({
      action: 'BULK_IMPORT_EMPLOYEES',
      details: `Imported ${results.success} employees. Failed: ${results.failed}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
<<<<<<< HEAD
      ipAddress: req.ip,
=======
      ipAddress: req.ip
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    }).catch(console.error);

    res.json({ message: 'Bulk import completed', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
