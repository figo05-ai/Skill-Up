const { body, validationResult } = require('express-validator');

/**
 * Strict password policy:
 * - minimum 8 characters
 * - at least 1 uppercase, 1 lowercase, 1 digit, 1 special symbol
 */
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, numeric, and special characters.';

const passwordStrengthValidator = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one numeric character.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special symbol.');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

/**
 * Regex-based password policy middleware for registration and credential changes.
 * Accepts `password` (register/create) or `newPassword` (password update).
 */
const validatePasswordPolicy = (req, res, next) => {
  const password = req.body.password || req.body.newPassword;

  if (!password) {
    return next();
  }

  if (!PASSWORD_POLICY_REGEX.test(password)) {
    return res.status(400).json({
      status: 'Error',
      message: PASSWORD_POLICY_MESSAGE,
    });
  }

  next();
};

/**
 * Rejects negative numeric employee fields at the HTTP layer (400 Bad Request).
 * Complements Sequelize model validators on PUT/POST employee routes.
 */
const NON_NEGATIVE_EMPLOYEE_FIELDS = ['holidays', 'monthlyWorkHours', 'attendancePercentage'];

const validateNonNegativeEmployeeFields = (req, res, next) => {
  for (const field of NON_NEGATIVE_EMPLOYEE_FIELDS) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      continue;
    }

    const value = Number(req.body[field]);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({
        status: 'Error',
        message: `${field} must be greater than or equal to 0`,
      });
    }
  }

  next();
};

module.exports = {
  PASSWORD_POLICY_REGEX,
  PASSWORD_POLICY_MESSAGE,
  NON_NEGATIVE_EMPLOYEE_FIELDS,
  passwordStrengthValidator,
  validate,
  validatePasswordPolicy,
  validateNonNegativeEmployeeFields,
};
