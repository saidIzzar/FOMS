const express = require('express');
const router = express.Router();
const { ProductionLog, MoldChangeLog, MoldRepairLog, Machine, Mold, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const logs = await ProductionLog.findAll({
      order: [['start_time', 'DESC']],
      limit: 100,
      include: [
        { model: Machine, as: 'machine', attributes: ['id', 'name', 'tonnage', 'status'] },
        { model: Mold, as: 'mold', attributes: ['id', 'code', 'product_name'] },
        { model: User, as: 'operator', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const log = await ProductionLog.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const log = await ProductionLog.findByPk(req.params.id, {
      include: [
        { model: Machine, as: 'machine', attributes: ['id', 'name', 'status'] },
        { model: Mold, as: 'mold', attributes: ['id', 'code', 'product_name'] }
      ]
    });
    if (!log) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const log = await ProductionLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    await log.update(req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const log = await ProductionLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    await log.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mold-changes', auth, async (req, res) => {
  try {
    const changes = await MoldChangeLog.findAll({
      order: [['change_time', 'DESC']],
      limit: 100
    });
    const changesWithMachine = await Promise.all(changes.map(async (change) => {
      const data = change.toJSON();
      if (data.machine_id) {
        const machine = await Machine.findByPk(data.machine_id, { attributes: ['id', 'name'] });
        data.machine = machine;
      }
      return data;
    }));
    res.json(changesWithMachine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mold-changes', auth, async (req, res) => {
  try {
    const change = await MoldChangeLog.create(req.body);
    res.status(201).json(change);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mold-repairs', auth, async (req, res) => {
  try {
    const repairs = await MoldRepairLog.findAll({
      order: [['repair_date', 'DESC']],
      limit: 100
    });
    const repairsWithMold = await Promise.all(repairs.map(async (repair) => {
      const data = repair.toJSON();
      if (data.mold_id) {
        const mold = await Mold.findByPk(data.mold_id, { attributes: ['id', 'code', 'product_name'] });
        data.mold = mold;
      }
      return data;
    }));
    res.json(repairsWithMold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mold-repairs', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const repair = await MoldRepairLog.create(req.body);
    res.status(201).json(repair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mold-changes/:id', auth, async (req, res) => {
  try {
    const change = await MoldChangeLog.findByPk(req.params.id, {
      include: [{ model: Machine, as: 'machine', attributes: ['id', 'name'] }]
    });
    if (!change) {
      return res.status(404).json({ error: 'Mold change not found' });
    }
    res.json(change);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mold-changes/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const change = await MoldChangeLog.findByPk(req.params.id);
    if (!change) {
      return res.status(404).json({ error: 'Mold change not found' });
    }
    await change.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mold-repairs/:id', auth, async (req, res) => {
  try {
    const repair = await MoldRepairLog.findByPk(req.params.id, {
      include: [{ model: Mold, as: 'mold', attributes: ['id', 'code', 'product_name'] }]
    });
    if (!repair) {
      return res.status(404).json({ error: 'Mold repair not found' });
    }
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/mold-repairs/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const repair = await MoldRepairLog.findByPk(req.params.id);
    if (!repair) {
      return res.status(404).json({ error: 'Mold repair not found' });
    }
    await repair.update(req.body);
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mold-repairs/:id', requireRole('admin'), async (req, res) => {
  try {
    const repair = await MoldRepairLog.findByPk(req.params.id);
    if (!repair) {
      return res.status(404).json({ error: 'Mold repair not found' });
    }
    await repair.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;