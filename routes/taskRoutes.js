const express = require('express');
const { protect, permit } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/taskController');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); next(); };

router.get('/', protect, ctrl.getTasks);
router.post('/', protect, permit('admin'), [check('title').notEmpty().withMessage('Title required')], validate, ctrl.createTask);
router.get('/:id', protect, ctrl.getTask);
router.put('/:id', protect, ctrl.updateTask);
router.delete('/:id', protect, permit('admin'), ctrl.deleteTask);
router.post('/seed', ctrl.seedTasks);

module.exports = router;