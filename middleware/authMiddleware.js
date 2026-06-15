const jwt = require('jsonwebtoken');
const Employee = require('../models/User');

// جلب المفتاح السري من بيئة التشغيل أو استخدام القيمة المباشرة كاحتياطي
const SECRET_KEY = process.env.JWT_SECRET || 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    // استخدام المتغير اللي عرفناه فوق بدل process.env مباشرة
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // fetch fresh user data
    const user = await Employee.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user; // attach full user
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    const msg = error.name === 'TokenExpiredError' ? 'Token expired' : 'Token invalid';
    res.status(401).json({ message: `Not authorized: ${msg}` });
  }
};

exports.permit = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Convenience helper for admin-only routes
exports.isAdmin = exports.permit('admin');
