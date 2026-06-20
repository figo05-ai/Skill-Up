const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { register, login, updateDetails, updatePassword, getUsers, deleteUser, getUserLogs, logAction } = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const { validatePasswordPolicy } = require('../middleware/validationMiddleware');
=======
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

<<<<<<< HEAD
// Public auth endpoints — no protect/isAdmin middleware on login or self-service register.
=======
// POST /api/auth/register
router.post(
  '/register',
  protect,
  isAdmin, // إضافة هذا القيد لمنع الموظفين العاديين من إنشاء حسابات
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  validate,
  register
);
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
// POST /api/auth/login
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

<<<<<<< HEAD
// POST /api/auth/register — admin-only account provisioning (requires auth)
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
=======
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3

router.get('/users', protect, isAdmin, getUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/users/:id/logs', protect, isAdmin, getUserLogs);
router.post('/log', protect, logAction);

module.exports = router;