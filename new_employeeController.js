const User = require('../models/User');

const sanitize = (emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    jobTitle: emp.jobTitle || 'N/A',
    department: emp.department || 'N/A',
    status: emp.status
});

exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({ where: { role: 'staff' } });
        res.json(employees.map(sanitize));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getEmployee = async (req, res) => {
    try {
        const e = await User.findByPk(req.params.id);
        if (!e) return res.status(404).json({ message: 'Not found' });
        res.json(sanitize(e));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createEmployee = async (req, res) => {
    try {
        const e = await User.create(req.body);
        res.json(sanitize(e));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateEmployee = async (req, res) => {
    try {
        const e = await User.findByPk(req.params.id);
        if (!e) return res.status(404).json({ message: 'Not found' });
        await e.update(req.body);
        res.json(sanitize(e));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const e = await User.findByPk(req.params.id);
        if (!e) return res.status(404).json({ message: 'Not found' });
        await e.destroy();
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.bulkCreateEmployees = async (req, res) => {
    try {
        await User.bulkCreate(req.body);
        res.json({ message: 'Imported' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
