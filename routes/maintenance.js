const express = require('express');
const router = express.Router();
const { MaintenanceLog, Machine } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const logs = await MaintenanceLog.findAll({
      order: [['scheduled_date', 'DESC']],
      limit: 100
    });
    const logsWithMachine = await Promise.all(logs.map(async (log) => {
      const data = log.toJSON();
      if (data.machine_id) {
        const machine = await Machine.findByPk(data.machine_id, { attributes: ['id', 'name', 'status'] });
        data.machine = machine;
      }
      return data;
    }));
    res.json(logsWithMachine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }
    const data = log.toJSON();
    if (data.machine_id) {
      const machine = await Machine.findByPk(data.machine_id, { attributes: ['id', 'name', 'status'] });
      data.machine = machine;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const log = await MaintenanceLog.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }
    await log.update(req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }
    await log.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;