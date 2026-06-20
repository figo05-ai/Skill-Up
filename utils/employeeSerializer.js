/**
 * Response serialization layer — strips internal/admin fields from API payloads
 * for non-privileged callers (staff role).
 */

const PUBLIC_EMPLOYEE_FIELDS = ['id', 'name', 'email', 'department'];

const SENSITIVE_FIELDS = [
  'identityNumber',
  'holidays',
  'monthlyWorkHours',
  'allowLogin',
  'password',
];

/** Roles that may receive full employee records (minus password). */
const PRIVILEGED_ROLES = new Set(['admin', 'system_user']);

const isPrivilegedRole = (role) => PRIVILEGED_ROLES.has(role);

const toPlain = (employee) => {
  if (!employee) return null;
  return employee.get ? employee.get({ plain: true }) : { ...employee };
};

/**
 * Serialize a single employee record based on caller privilege level.
 * @param {object} employee - Sequelize instance or plain object
 * @param {{ privileged?: boolean }} options
 */
const serializeEmployee = (employee, { privileged = false } = {}) => {
  const plain = toPlain(employee);
  if (!plain) return null;

  delete plain.password;

  if (privileged) {
    return plain;
  }

  return PUBLIC_EMPLOYEE_FIELDS.reduce((acc, key) => {
    if (plain[key] !== undefined) acc[key] = plain[key];
    return acc;
  }, {});
};

const serializeEmployees = (employees, options = {}) =>
  employees.map((emp) => serializeEmployee(emp, options));

module.exports = {
  PUBLIC_EMPLOYEE_FIELDS,
  SENSITIVE_FIELDS,
  PRIVILEGED_ROLES,
  isPrivilegedRole,
  serializeEmployee,
  serializeEmployees,
};
