const Task = require('../models/Task');
const Employee = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { Op } = require('sequelize');

// ensure association
// This function is invalid because it tries to associate a Sequelize model with a Mongoose model.
// const ensureAssociation = () => { ... };

exports.createTask = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user.id };
    const task = await Task.create(payload);

    await SystemLog.create({
      action: 'CREATE_TASK',
      details: `Created task: ${task.title}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.status(201).json(task);
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const where = (req.user.role === 'admin') ? {} : { assignedTo: req.user.id };

    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate); 
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.endDate); 
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const tasksRaw = await Task.findAll({ where, order: [['createdAt', 'DESC']], raw: true });

    // Manually "join" the data from two different databases
    const userIds = [...new Set(tasksRaw.map(t => t.assignedTo).filter(Boolean))];
    if (userIds.length > 0) {
      const users = await Employee.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'email'], raw: true });
      const userMap = new Map(users.map(u => [u.id.toString(), u]));

      const tasksWithUsers = tasksRaw.map(task => ({
        ...task,
        // Sequelize returns `assignedTo`, we add `assigned` to match the old structure
        assigned: userMap.get(String(task.assignedTo)) || null,
      }));
      return res.json(tasksWithUsers);
    }

    res.json(tasksRaw); // Return raw if no users to join
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { raw: true });
    if (!task) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'admin' && (!task.assignedTo || task.assignedTo.toString() !== String(req.user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (task.assignedTo) {
      const user = await Employee.findByPk(task.assignedTo, { attributes: ['name', 'email'], raw: true });
      task.assigned = user;
    }

    res.json(task);
  } catch (err) { 
    console.error('getTask error:', err); res.status(500).json({ message: 'Server error', detail: err.message }); 
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'admin') {
      if (!task.assignedTo || String(task.assignedTo) !== String(req.user.id))
        return res.status(403).json({ message: 'Forbidden' });
      const { status, progressPercentage } = req.body;
      const payload = {};
      if (status) payload.status = status;
      if (typeof progressPercentage !== 'undefined') payload.progressPercentage = Math.max(0, Math.min(100, progressPercentage));
      await task.update(payload);
    } else {
      await task.update(req.body);
    }

    await SystemLog.create({
      action: 'UPDATE_TASK',
      details: `Updated task: ${task.title}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.json(task);
  } catch (err) { console.error('updateTask error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    const title = task.title;
    await task.destroy();

    await SystemLog.create({
      action: 'DELETE_TASK',
      details: `Deleted task: ${title}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteTask error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.seedTasks = async (req, res) => {
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const employees = await Employee.findAll({ where: { role: 'staff' } });
    const tasks = [];
    const titles = [
      'Update client report', 'Fix navigation bug', 'Design new logo',
      'Meeting with team', 'Review PRs', 'Database backup',
      'Client call', 'Write documentation', 'Test new feature',
      'Optimize queries', 'Update dependencies', 'Security audit'
    ];

    for (const emp of employees) {
      // Create 2-4 tasks per employee
      const count = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < count; i++) {
        const taskDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const deadline = new Date(taskDate);
        deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 5) + 1);

        const statusRoll = Math.random();
        let status = 'todo';
        let progress = 0;

        if (statusRoll > 0.6) {
            status = 'completed';
            progress = 100;
        } else if (statusRoll > 0.3) {
            status = 'in-progress';
            progress = Math.floor(Math.random() * 80) + 10;
        }

        tasks.push({
          title: titles[Math.floor(Math.random() * titles.length)],
          description: 'Auto-generated task for testing.',
          assignedTo: emp.id,
          deadline: deadline,
          status: status,
          progressPercentage: progress,
          createdBy: null,
          createdAt: taskDate,
          updatedAt: taskDate
        });
      }
    }

    await Task.bulkCreate(tasks);
    res.json({ message: `Successfully generated ${tasks.length} tasks` });
  } catch (err) {
    console.error('seedTasks error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};
