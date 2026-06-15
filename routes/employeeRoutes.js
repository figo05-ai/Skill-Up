const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { Op } = require('sequelize');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/User');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/employees/ - list all employees (protected)
router.get('/', protect, employeeController.getEmployees);
// GET /api/employees/:id - single employee
router.get('/:id', protect, employeeController.getEmployee);
// POST /api/employees/ - create (admin only)
router.post(
  '/',
  protect,
  isAdmin, // قصر إضافة الموظفين على المدير فقط
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('department').optional().isString().withMessage('Department must be a string'),
  ],
  validate,
  employeeController.createEmployee
);

// POST /api/employees/bulk - bulk create (admin only)
router.post('/bulk', protect, isAdmin, async (req, res) => {
  const { employees } = req.body;
  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ message: 'Invalid data format. Expected { employees: [] }' });
  }

  let successCount = 0;
  const errors = [];

  for (const empData of employees) {
    try {
      // Check if employee exists by email
      const existingEmp = await Employee.findOne({ where: { email: empData.email } });
      
      // Check if phone exists for a DIFFERENT employee
      if (empData.phone) {
        const phoneExists = await Employee.findOne({ 
          where: { 
            phone: empData.phone,
            email: { [Op.ne]: empData.email } // Exclude current employee if updating
          } 
        });
        if (phoneExists) throw new Error(`رقم الهاتف ${empData.phone} مسجل لموظف آخر (${phoneExists.name})`);
      }

      // Check if identityNumber exists for a DIFFERENT employee
      if (empData.identityNumber) {
        // Validate identity number format (must be 10 digits)
        if (!/^\d{10}$/.test(empData.identityNumber)) {
          throw new Error(`رقم الهوية ${empData.identityNumber} غير صحيح (يجب أن يتكون من 10 أرقام)`);
        }

        const idExists = await Employee.findOne({ 
          where: { 
            identityNumber: empData.identityNumber,
            email: { [Op.ne]: empData.email } // Exclude current employee if updating
          } 
        });
        if (idExists) throw new Error(`رقم الهوية ${empData.identityNumber} مسجل لموظف آخر (${idExists.name})`);
      }

      if (existingEmp) {
        // Update existing employee - Only update fields that are present and not empty
        const updates = {};
        Object.keys(empData).forEach(key => {
          if (empData[key] !== null && empData[key] !== '' && empData[key] !== undefined) {
            updates[key] = empData[key];
          }
        });
        await existingEmp.update(updates);
        successCount++;
      } else {
        // Create new employee
        // Set default password only for new employees if not provided
        if (!empData.password) empData.password = '123456';
        await Employee.create(empData);
        successCount++;
      }
    } catch (error) {
      let msg = error.message;
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        msg = error.errors.map(e => e.message).join(', ');
      }
      const empIdentifier = empData.name || empData.email || 'Unnamed Row';
      errors.push(`${empIdentifier}: ${msg}`);
    }
  }

  res.json({ successCount, errors });
});

// PUT /api/employees/:id - update (admin only)
router.put(
  '/:id',
  protect,
  isAdmin,
  [
    check('email').optional().isEmail().withMessage('Valid email is required'),
    check('department').optional().isString().withMessage('Department must be a string'),
    check('role').optional().isIn(['admin', 'staff', 'system_user']).withMessage('Role must be admin, staff or system_user'),
  ],
  validate,
  employeeController.updateEmployee
);
// DELETE /api/employees/:id - delete (admin only)
router.delete('/:id', protect, isAdmin, employeeController.deleteEmployee);

module.exports = router;