const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Machine, MoldProcess, MachineLog, OptimalParameter, Mold } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const machines = await Machine.findAll({ 
      order: [['id', 'ASC']],
      include: [
        { model: MoldProcess, as: 'currentProcess', required: false, where: { is_active: true } }
      ]
    });
    
    const machinesWithProcess = machines.map(machine => {
      const data = machine.toJSON();
      if (data.currentProcess) {
        data.injection_temp = data.currentProcess.injection_temperature;
        data.mold_temp = data.currentProcess.mold_temperature;
        data.cycle_time = data.currentProcess.cycle_time;
        data.injection_speed = data.currentProcess.injection_speed;
        data.holding_pressure = data.currentProcess.holding_pressure;
        data.cooling_time = data.currentProcess.cooling_time;
        data.material = data.currentProcess.material;
      } else {
        data.injection_temp = 220;
        data.mold_temp = 25;
        data.cycle_time = 30;
        data.injection_speed = 50;
        data.holding_pressure = 100;
        data.cooling_time = 10;
        data.material = 'PP';
      }
      data.efficiency = Math.floor(Math.random() * 15 + 80);
      delete data.currentProcess;
      return data;
    });
    
    res.json(machinesWithProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id, {
      include: [
        { model: MoldProcess, as: 'currentProcess', required: false, where: { is_active: true } }
      ]
    });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const data = machine.toJSON();
    if (data.currentProcess) {
      data.injection_temp = data.currentProcess.injection_temperature;
      data.mold_temp = data.currentProcess.mold_temperature;
      data.cycle_time = data.currentProcess.cycle_time;
      data.injection_speed = data.currentProcess.injection_speed;
      data.holding_pressure = data.currentProcess.holding_pressure;
      data.cooling_time = data.currentProcess.cooling_time;
      data.material = data.currentProcess.material;
    } else {
      data.injection_temp = 220;
      data.mold_temp = 25;
      data.cycle_time = 30;
      data.injection_speed = 50;
      data.holding_pressure = 100;
      data.cooling_time = 10;
      data.material = 'PP';
    }
    data.efficiency = Math.floor(Math.random() * 15 + 80);
    delete data.currentProcess;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const { injection_temp, mold_temp, cycle_time, injection_speed, 
            holding_pressure, cooling_time, material, ...machineData } = req.body;
    
    const machine = await Machine.create(machineData);
    
    if (injection_temp || mold_temp || cycle_time || injection_speed || holding_pressure || cooling_time || material) {
      await MoldProcess.create({
        machine_id: machine.id,
        injection_temperature: injection_temp || 220,
        mold_temperature: mold_temp || 25,
        cycle_time: cycle_time || 30,
        injection_speed: injection_speed || 50,
        holding_pressure: holding_pressure || 100,
        cooling_time: cooling_time || 10,
        material: material || 'PP',
        is_active: true
      });
    }
    
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const { injection_temp, mold_temp, cycle_time, injection_speed, 
            holding_pressure, cooling_time, material, ...machineData } = req.body;
    
    await machine.update(machineData);
    
    if (injection_temp !== undefined || mold_temp !== undefined || 
        cycle_time !== undefined || material !== undefined) {
      
      const [process, created] = await MoldProcess.findOrCreate({
        where: { machine_id: machine.id, is_active: true },
        defaults: {
          machine_id: machine.id,
          injection_temperature: injection_temp || 220,
          mold_temperature: mold_temp || 25,
          cycle_time: cycle_time || 30,
          injection_speed: injection_speed || 50,
          holding_pressure: holding_pressure || 100,
          cooling_time: cooling_time || 10,
          material: material || 'PP',
          is_active: true
        }
      });
      
      if (!created) {
        await process.update({
          injection_temperature: injection_temp ?? process.injection_temperature,
          mold_temperature: mold_temp ?? process.mold_temperature,
          cycle_time: cycle_time ?? process.cycle_time,
          injection_speed: injection_speed ?? process.injection_speed,
          holding_pressure: holding_pressure ?? process.holding_pressure,
          cooling_time: cooling_time ?? process.cooling_time,
          material: material ?? process.material
        });
      }
    }
    
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    await machine.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/logs', auth, async (req, res) => {
  try {
    const { machine_id } = req.query;
    const where = machine_id ? { machine_id } : {};
    const logs = await MachineLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-reglage/', auth, async (req, res) => {
  try {
    const { machine_id, settings } = req.body;
    
    const [moldProcess, created] = await MoldProcess.findOrCreate({
      where: { machine_id },
      defaults: { machine_id, ...settings }
    });
    
    if (!created) {
      await moldProcess.update(settings);
    }
    
    await MachineLog.create({
      machine_id,
      event_type: 'reglage_saved',
      description: 'Machine settings saved',
      created_by: req.user.id
    });
    
    res.json(moldProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mold-settings/', auth, async (req, res) => {
  try {
    const { machine_id, mold_id, settings } = req.body;
    
    const moldProcess = await MoldProcess.findOne({ where: { machine_id } });
    
    if (moldProcess) {
      await moldProcess.update({ mold_id, ...settings });
      res.json(moldProcess);
    } else {
      const newProcess = await MoldProcess.create({
        machine_id,
        mold_id,
        ...settings
      });
      res.json(newProcess);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/smart-check-parameters/', auth, async (req, res) => {
  try {
    const { machine_id, tonnage, material } = req.body;
    
    const optimalParams = await OptimalParameter.findAll({
      where: {
        material,
        tonnage_min: { [Op.lte]: tonnage },
        tonnage_max: { [Op.gte]: tonnage }
      }
    });
    
    if (optimalParams.length === 0) {
      const allParams = await OptimalParameter.findAll({ where: { material } });
      return res.json({
        compatible: true,
        warning: 'No exact match found, using default parameters',
        parameters: allParams[0] || null
      });
    }
    
    const params = optimalParams[0];
    res.json({
      compatible: true,
      parameters: params
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/optimal-parameters', auth, async (req, res) => {
  try {
    const params = await OptimalParameter.findAll();
    res.json(params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/optimal-parameters', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const param = await OptimalParameter.create(req.body);
    res.status(201).json(param);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;