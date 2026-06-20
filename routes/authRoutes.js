const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  updateDetails,
  updatePassword,
  getUsers,
  deleteUser,
  getUserLogs,
  logAction,
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { validatePasswordPolicy } = require('../middleware/validationMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Public — no protect/isAdmin middleware on login
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Admin-only account provisioning (requires auth + password policy)
router.post(
  '/register',
  protect,
  isAdmin,
  validatePasswordPolicy,
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
  ],
  validate,
  register
);

router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, validatePasswordPolicy, updatePassword);

router.get('/users', protect, isAdmin, getUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/users/:id/logs', protect, isAdmin, getUserLogs);
router.post('/log', protect, logAction);

module.exports = router;
