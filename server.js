// 1. تشغيل متغيرات البيئة في أول سطر خالص مع تحديد المسار المباشر
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
// مسحنا const dotenv = require('dotenv'); من هنا لأننا شغلناه فوق
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const seedOnStart = require('./seedOnStart');

const app = express(); // ده موجود عندك
// ... كمل باقي الكود بتاعك زي ما هو من أول هنا ...

app.set('trust proxy', 1); // <--- ضيف السطر ده ضروري
// CORS (restrict in production via CLIENT_URL env)
const corsOptions = { 
  origin: process.env.CLIENT_URL || '*', // يجب ضبط CLIENT_URL في ملف .env عند الرفع
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middlewares
app.use(morgan('dev'));
// Security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? true : false, //  تفعيل CSP في الإنتاج فقط
}));
<<<<<<< HEAD
// Basic rate limiting (global baseline)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter limiter for auth endpoints — 100 requests / 15 minutes / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'Error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
=======
// Basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use(limiter);

app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/debug', require('./routes/debugRoutes'));

// Serve Frontend in Production
// في وضع الإنتاج، سيقوم السيرفر بتقديم ملفات React من مجلد public
if (process.env.NODE_ENV === 'production') {
<<<<<<< HEAD
  // 1. أمر للسيرفر يستخدم ملفات فولدر dist
=======
//   // 1. أمر للسيرفر يستخدم ملفات فولدر dist
>>>>>>> 90cb0635b46f08d24cbaf6ae3056f35bb8a295f3
app.use(express.static(path.join(__dirname, 'dist')));

// 2. أمر عشان لو المستخدم عمل Refresh في أي صفحة، يرجعه للموقع (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// لازم تستخدم process.env.PORT
const PORT = process.env.PORT || 5000; 

const startServer = async () => {
  try {
    await connectDB();
    await seedOnStart();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
