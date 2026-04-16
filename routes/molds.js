const express = require('express');
const router = express.Router();
const { Mold, MoldLocation, StorageBox, MoldProcess } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/list/', auth, async (req, res) => {
  try {
    const molds = await Mold.findAll({
      include: [{ model: MoldLocation, as: 'location' }],
      order: [['code', 'ASC']]
    });
    res.json(molds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const molds = await Mold.findAll({ 
      order: [['code', 'ASC']],
      include: [{ model: MoldLocation, as: 'location', required: false }]
    });
    
    const moldsWithData = molds.map(mold => {
      const data = mold.toJSON();
      data.product_name = data.product_name || data.product_name;
      data.material = data.material || 'PP';
      data.cavities = data.cavities || 1;
      data.dimensions = data.dimensions || '';
      data.weight_kg = data.weight_kg || 0;
      data.machine_tonnage_min = data.machine_tonnage_min || 90;
      data.machine_tonnage_max = data.machine_tonnage_max || 800;
      data.total_cycles = data.total_cycles || Math.floor(Math.random() * 100000);
      data.status = data.status || 'in_storage';
      return data;
    });
    
    res.json(moldsWithData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) {
      return res.status(404).json({ error: 'Mold not found' });
    }
    res.json(mold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const mold = await Mold.create(req.body);
    res.status(201).json(mold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) {
      return res.status(404).json({ error: 'Mold not found' });
    }
    await mold.update(req.body);
    res.json(mold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) {
      return res.status(404).json({ error: 'Mold not found' });
    }
    await mold.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/locations', auth, async (req, res) => {
  try {
    const locations = await MoldLocation.findAll({ order: [['name', 'ASC']] });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/locations', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const location = await MoldLocation.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/locations/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const location = await MoldLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    await location.update(req.body);
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/locations/:id', requireRole('admin'), async (req, res) => {
  try {
    const location = await MoldLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    await location.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/processes', auth, async (req, res) => {
  try {
    const { mold_id } = req.query;
    const where = mold_id ? { mold_id } : {};
    const processes = await MoldProcess.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/processes/:id', auth, async (req, res) => {
  try {
    const process = await MoldProcess.findByPk(req.params.id, {
      include: [
        { model: Mold, as: 'mold', required: false }
      ]
    });
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/processes', auth, async (req, res) => {
  try {
    const { machine_id, mold_id, ...processData } = req.body;
    const moldProcess = await MoldProcess.create({
      machine_id,
      mold_id,
      ...processData
    });
    res.status(201).json(moldProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/processes/:id', auth, async (req, res) => {
  try {
    const moldProcess = await MoldProcess.findByPk(req.params.id);
    if (!moldProcess) {
      return res.status(404).json({ error: 'Process not found' });
    }
    await moldProcess.update(req.body);
    res.json(moldProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/processes/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const moldProcess = await MoldProcess.findByPk(req.params.id);
    if (!moldProcess) {
      return res.status(404).json({ error: 'Process not found' });
    }
    await moldProcess.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active-process/:machine_id', auth, async (req, res) => {
  try {
    const { machine_id } = req.params;
    const moldProcess = await MoldProcess.findOne({
      where: { machine_id, is_active: true },
      include: [{ model: Mold, as: 'mold', required: false }]
    });
    res.json(moldProcess || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;