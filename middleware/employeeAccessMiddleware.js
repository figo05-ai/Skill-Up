/**
 * Object-level authorization (BOLA/IDOR) guards for employee resources.
 */

const { isPrivilegedRole } = require('../utils/employeeSerializer');

/**
 * Staff may only read their own employee record; admins/system users may read any.
 * Attach to GET /api/employees/:id before the controller.
 */
exports.requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const requestedId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(requestedId)) {
    return res.status(400).json({ status: 'Error', message: 'Invalid employee id' });
  }

  if (isPrivilegedRole(req.user.role)) {
    return next();
  }

  if (req.user.id !== requestedId) {
    return res.status(403).json({
      status: 'Error',
      message: 'Forbidden: you may only access your own employee record',
    });
  }

  next();
};
