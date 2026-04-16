const express = require('express');
const router = express.Router();
const { MaterialSupplier, MaterialReception, MaterialTest } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/suppliers', auth, async (req, res) => {
  try {
    const suppliers = await MaterialSupplier.findAll({ order: [['name', 'ASC']] });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suppliers/:id', auth, async (req, res) => {
  try {
    const supplier = await MaterialSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suppliers', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const supplier = await MaterialSupplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/suppliers/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const supplier = await MaterialSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/suppliers/:id', requireRole('admin'), async (req, res) => {
  try {
    const supplier = await MaterialSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    await supplier.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/receptions', auth, async (req, res) => {
  try {
    const receptions = await MaterialReception.findAll({
      order: [['reception_date', 'DESC']],
      limit: 100
    });
    const receptionsWithSupplier = await Promise.all(receptions.map(async (reception) => {
      const data = reception.toJSON();
      if (data.supplier_id) {
        const supplier = await MaterialSupplier.findByPk(data.supplier_id, { attributes: ['id', 'name'] });
        data.supplier = supplier;
      }
      return data;
    }));
    res.json(receptionsWithSupplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/receptions', auth, async (req, res) => {
  try {
    const reception = await MaterialReception.create(req.body);
    res.status(201).json(reception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/receptions/:id', auth, async (req, res) => {
  try {
    const reception = await MaterialReception.findByPk(req.params.id, {
      include: [{ model: MaterialSupplier, as: 'supplier', attributes: ['id', 'name'] }]
    });
    if (!reception) {
      return res.status(404).json({ error: 'Reception not found' });
    }
    res.json(reception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/receptions/:id', auth, async (req, res) => {
  try {
    const reception = await MaterialReception.findByPk(req.params.id);
    if (!reception) {
      return res.status(404).json({ error: 'Reception not found' });
    }
    await reception.update(req.body);
    res.json(reception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/receptions/:id', requireRole('admin'), async (req, res) => {
  try {
    const reception = await MaterialReception.findByPk(req.params.id);
    if (!reception) {
      return res.status(404).json({ error: 'Reception not found' });
    }
    await reception.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tests', auth, async (req, res) => {
  try {
    const tests = await MaterialTest.findAll({
      order: [['test_date', 'DESC']],
      limit: 100
    });
    const testsWithReception = await Promise.all(tests.map(async (test) => {
      const data = test.toJSON();
      if (data.reception_id) {
        const reception = await MaterialReception.findByPk(data.reception_id, { attributes: ['id', 'batch_number', 'material_type'] });
        data.reception = reception;
      }
      return data;
    }));
    res.json(testsWithReception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tests', auth, async (req, res) => {
  try {
    const test = await MaterialTest.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tests/:id', auth, async (req, res) => {
  try {
    const test = await MaterialTest.findByPk(req.params.id, {
      include: [{ model: MaterialReception, as: 'reception', attributes: ['id', 'batch_number', 'material_type'] }]
    });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/tests/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const test = await MaterialTest.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    await test.update(req.body);
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tests/:id', requireRole('admin'), async (req, res) => {
  try {
    const test = await MaterialTest.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    await test.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;