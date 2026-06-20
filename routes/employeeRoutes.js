const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { Op } = require('sequelize');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { requireSelfOrAdmin } = require('../middleware/employeeAccessMiddleware');
const {
  validatePasswordPolicy,
  validateNonNegativeEmployeeFields,
} = require('../middleware/validationMiddleware');
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/User');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', protect, employeeController.getEmployees);

// Staff may only read their own record; admins may read any
router.get('/:id', protect, requireSelfOrAdmin, employeeController.getEmployee);

router.post(
  '/',
  protect,
  isAdmin,
  validatePasswordPolicy,
  validateNonNegativeEmployeeFields,
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('department').optional().isString().withMessage('Department must be a string'),
  ],
  validate,
  employeeController.createEmployee
);

router.post('/bulk', protect, isAdmin, async (req, res) => {
  const { employees } = req.body;
  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ message: 'Invalid data format. Expected { employees: [] }' });
  }

  let successCount = 0;
  const errors = [];

  for (const empData of employees) {
    try {
      const existingEmp = await Employee.findOne({ where: { email: empData.email } });

      if (empData.phone) {
        const phoneExists = await Employee.findOne({
          where: {
            phone: empData.phone,
            email: { [Op.ne]: empData.email },
          },
        });
        if (phoneExists) {
          throw new Error(`رقم الهاتف ${empData.phone} مسجل لموظف آخر (${phoneExists.name})`);
        }
      }

      if (empData.identityNumber) {
        if (!/^\d{10}$/.test(empData.identityNumber)) {
          throw new Error(`رقم الهوية ${empData.identityNumber} غير صحيح (يجب أن يتكون من 10 أرقام)`);
        }

        const idExists = await Employee.findOne({
          where: {
            identityNumber: empData.identityNumber,
            email: { [Op.ne]: empData.email },
          },
        });
        if (idExists) {
          throw new Error(`رقم الهوية ${empData.identityNumber} مسجل لموظف آخر (${idExists.name})`);
        }
      }

      if (existingEmp) {
        const updates = {};
        Object.keys(empData).forEach((key) => {
          if (empData[key] !== null && empData[key] !== '' && empData[key] !== undefined) {
            updates[key] = empData[key];
          }
        });
        await existingEmp.update(updates);
        successCount++;
      } else {
        if (!empData.password) empData.password = '123456';
        await Employee.create(empData);
        successCount++;
      }
    } catch (error) {
      let msg = error.message;
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        msg = error.errors.map((e) => e.message).join(', ');
      }
      const empIdentifier = empData.name || empData.email || 'Unnamed Row';
      errors.push(`${empIdentifier}: ${msg}`);
    }
  }

  res.json({ successCount, errors });
});

router.put(
  '/:id',
  protect,
  isAdmin,
  validatePasswordPolicy,
  validateNonNegativeEmployeeFields,
  [
    check('email').optional().isEmail().withMessage('Valid email is required'),
    check('department').optional().isString().withMessage('Department must be a string'),
    check('role').optional().isIn(['admin', 'staff', 'system_user']).withMessage('Role must be admin, staff or system_user'),
    check('holidays').optional().isInt({ min: 0 }).withMessage('Holidays must be a non-negative integer'),
    check('monthlyWorkHours').optional().isFloat({ min: 0 }).withMessage('Monthly work hours must be a non-negative number'),
    check('attendancePercentage').optional().isFloat({ min: 0 }).withMessage('Attendance percentage must be a non-negative number'),
  ],
  validate,
  employeeController.updateEmployee
);

router.delete('/:id', protect, isAdmin, employeeController.deleteEmployee);

module.exports = router;
