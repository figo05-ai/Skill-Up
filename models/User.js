const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: { isEmail: true }
  },
  personalEmail: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  phone: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  password: { type: DataTypes.STRING, allowNull: false },
  identityNumber: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('admin', 'staff', 'system_user'), defaultValue: 'staff' },
  jobTitle: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  nationality: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  joiningDate: { type: DataTypes.DATE, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  status: { type: DataTypes.ENUM('active', 'remote', 'inactive'), defaultValue: 'active' },
<<<<<<< HEAD
  attendancePercentage: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'attendancePercentage must be strictly greater than or equal to 0'
      }
    }
  },
  client: { type: DataTypes.STRING, allowNull: true },
  holidays: { 
    type: DataTypes.INTEGER, 
    defaultValue: 8,
    validate: {
      min: {
        args: [0],
        msg: 'holidays must be strictly greater than or equal to 0'
      }
    }
  },
  monthlyWorkHours: { 
    type: DataTypes.FLOAT, 
    defaultValue: 176,
    validate: {
      min: {
        args: [0],
        msg: 'monthlyWorkHours must be strictly greater than or equal to 0'
      }
    }
  },
  // Default true so legacy/unconfigured rows are not locked out of login.
  // Explicit false disables portal access for attendance-only records.
  allowLogin: { type: DataTypes.BOOLEAN, defaultValue: true },
=======
  attendancePercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  client: { type: DataTypes.STRING, allowNull: true },
  holidays: { type: DataTypes.INTEGER, defaultValue: 8 },
  monthlyWorkHours: { type: DataTypes.FLOAT, defaultValue: 176 },
  allowLogin: { type: DataTypes.BOOLEAN, defaultValue: false },
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
}, {
  tableName: 'employees',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

Employee.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

<<<<<<< HEAD
/**
 * Only block login when allowLogin is explicitly false.
 * null/undefined remain allowed for backward-compatible records.
 */
Employee.prototype.canLogin = function () {
  return this.allowLogin !== false;
};

=======
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
module.exports = Employee;