const express = require('express');
const { protect, permit } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dashboardController');
const router = express.Router();

router.get('/summary', protect, permit('admin'), ctrl.summary);

module.exports = router;