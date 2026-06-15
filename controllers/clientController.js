const Client = require('../models/Client');
const SystemLog = require('../models/SystemLog');
const Employee = require('../models/User');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    if (!Client || typeof Client.findAll !== 'function') {
      console.error('Client model is not loaded correctly:', Client);
      throw new Error('Client model is not loaded correctly');
    }
    const clients = await Client.findAll({ order: [['name', 'ASC']] });
    res.json(clients);
  } catch (error) {
    console.error('getClients error:', error);
    res.status(500).json({ 
      message: error.message || 'Server Error', 
      detail: error.toString() 
    });
  }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  const { name, email, personalId, commercialRecord, laborOfficeNumber, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  try {
    const clientExists = await Client.findOne({ where: { name } });
    if (clientExists) {
      return res.status(400).json({ message: 'Client already exists' });
    }

    const createdClient = await Client.create({ name, email, personalId, commercialRecord, laborOfficeNumber, phone, address });

    await SystemLog.create({
      action: 'CREATE_CLIENT',
      details: `Created client: ${name}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.status(201).json(createdClient);
  } catch (error) {
    console.error('createClient error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    await client.update(req.body);

    await SystemLog.create({
      action: 'UPDATE_CLIENT',
      details: `Updated client: ${client.name}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.json(client);
  } catch (error) {
    console.error('updateClient error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Client name already exists' });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    const clientName = client.name;
    
    // DELETE employees associated with this client instead of unlinking
    await Employee.destroy({ where: { client: client.id } });

    await client.destroy();

    await SystemLog.create({
      action: 'DELETE_CLIENT',
      details: `Deleted client: ${clientName}`,
      performedBy: req.user ? `${req.user.name} (${req.user.email})` : 'Unknown',
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ message: 'Client deleted' });
  } catch (error) {
    console.error('deleteClient error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};