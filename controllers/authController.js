const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { Op } = require('sequelize');
<<<<<<< HEAD
const { serializeEmployee } = require('../utils/employeeSerializer');

const SECRET_KEY = process.env.JWT_SECRET || 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    SECRET_KEY,
=======

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email }, 
    'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e', 
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
    { expiresIn: '7d' }
  );
};

<<<<<<< HEAD
const toAuthUser = (user) =>
  serializeEmployee(user, { privileged: user.role === 'admin' || user.role === 'system_user' });

=======
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, clientId } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = await User.create({ name, email, password, role: role || 'staff', allowLogin: true });

    const token = generateToken(user);

    await SystemLog.create({
      action: 'REGISTER_USER',
      details: `Registered user: ${name} (${email}) - Role: ${role || 'staff'}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Self/Public',
      userId: req.user ? req.user.id : user.id,
      ipAddress: req.ip
    }).catch(console.error);

<<<<<<< HEAD
    res.status(201).json({ token, user: toAuthUser(user) });
=======
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const logs = await SystemLog.findAll({
      where: {
        [Op.or]: [
          { userId: id },
          { performedBy: { [Op.like]: `%${user.email}%` } }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

<<<<<<< HEAD
    // Block only when explicitly disabled; null/undefined must not hard-fail login.
    if (!user.canLogin()) {
      return res.status(403).json({ message: 'Access denied. Not a system user.' });
    }
=======
    if (!user.allowLogin) return res.status(403).json({ message: 'Access denied. Not a system user.' });
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    await SystemLog.create({
      action: 'LOGIN',
      details: 'User logged in successfully',
      performedBy: `${user.name} (${user.email})`,
      userId: user.id,
      ipAddress: req.ip
    }).catch(console.error);

<<<<<<< HEAD
    res.json({ token, user: toAuthUser(user) });
=======
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    
    await user.save();

    await SystemLog.create({
      action: 'UPDATE_PROFILE',
      details: `Updated profile details`,
      performedBy: `${user.name} (${user.email})`,
      userId: user.id,
      ipAddress: req.ip
    }).catch(console.error);

<<<<<<< HEAD
    res.json({ success: true, user: toAuthUser(user) });
=======
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();

    await SystemLog.create({
      action: 'UPDATE_PASSWORD',
      details: `Changed password`,
      performedBy: `${user.name} (${user.email})`,
      userId: user.id,
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        name: { [Op.ne]: 'Felopater' },
        [Op.or]: [
          { allowLogin: true },
          { role: { [Op.in]: ['admin', 'system_user'] } }
        ]
      },
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.id === user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    const userName = user.name;
    const userEmail = user.email;
    await user.destroy();

    await SystemLog.create({
      action: 'DELETE_USER',
      details: `Deleted user: ${userName} (${userEmail})`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logAction = async (req, res) => {
  try {
    const { action, details } = req.body;
    await SystemLog.create({
      action: action || 'USER_ACTION',
      details: details || '',
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
