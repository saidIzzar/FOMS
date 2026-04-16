const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Machine, MachineSpec, OptimalParameter, Mold } = require('../models');
const { auth } = require('../middleware/auth');
const { findCompatibleMachines, isMoldCompatible } = require('../services/compatibility');
const { recommendMachines, calculateEfficiency, optimizeFactoryLayout, simulateProduction } = require('../services/ai-engine');

const MATERIALS = ['PP', 'ABS', 'PA', 'PC', 'PE', 'PVC', 'PS', 'POM'];
const MACHINE_MODELS = ['Mars', 'Zhafir', 'El'];

// Get all machine specs (Haitian catalog)
router.get('/machine-specs', auth, async (req, res) => {
  try {
    const specs = await MachineSpec.findAll({
      order: [['tonnage', 'ASC']]
    });
    res.json(specs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single machine spec
router.get('/machine-specs/:spec_id', auth, async (req, res) => {
  try {
    const spec = await MachineSpec.findOne({
      where: { spec_id: req.params.spec_id }
    });
    if (!spec) {
      return res.status(404).json({ error: 'Machine spec not found' });
    }
    res.json(spec);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check mold-machine compatibility
router.post('/compatibility-check', auth, async (req, res) => {
  try {
    const { machine_id, mold_id, mold_data } = req.body;
    
    let machine, mold;
    
    if (machine_id) {
      machine = await Machine.findByPk(machine_id, {
        include: [{ model: MachineSpec, as: 'spec' }]
      });
    }
    
    if (mold_id) {
      mold = await Mold.findByPk(mold_id);
    } else if (mold_data) {
      mold = mold_data;
    }
    
    if (!machine && !mold_data) {
      return res.status(400).json({ error: 'Either machine_id or mold_data is required' });
    }
    
    if (!mold && !mold_id) {
      return res.status(400).json({ error: 'Either mold_id or mold_data is required' });
    }
    
    // Build mold data for compatibility check
    const moldInfo = mold_data || {
      width_mm: mold.dimensions ? parseInt(mold.dimensions.split('x')[0]) : 400,
      height_mm: mold.dimensions ? parseInt(mold.dimensions.split('x')[1]) : 400,
      required_tonnage: mold.machine_tonnage_min || 160,
      shot_volume_cm3: mold.cavities ? mold.cavities * 20 : 100
    };
    
    if (machine && machine.spec) {
      const result = isMoldCompatible(machine.spec, moldInfo);
      return res.json({
        machine: {
          id: machine.id,
          name: machine.name,
          tonnage: machine.tonnage,
          spec: machine.spec
        },
        mold: mold_data || mold,
        ...result
      });
    }
    
    // If no specific machine, return compatibility for all machines
    const machines = await Machine.findAll({
      include: [{ model: MachineSpec, as: 'spec' }]
    });
    
    const result = findCompatibleMachines(moldInfo, machines);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Machine Recommendation
router.post('/recommend', auth, async (req, res) => {
  try {
    const { mold_id, mold_data } = req.body;
    
    let mold;
    if (mold_id) {
      mold = await Mold.findByPk(mold_id);
    } else if (mold_data) {
      mold = mold_data;
    }
    
    if (!mold) {
      return res.status(400).json({ error: 'Mold not found or no mold data provided' });
    }
    
    const machines = await Machine.findAll({
      include: [{ model: MachineSpec, as: 'spec' }]
    });
    
    const result = recommendMachines(mold, machines);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate production efficiency
router.post('/efficiency', auth, async (req, res) => {
  try {
    const { machine_id, actual_cycle_time } = req.body;
    
    if (!machine_id || !actual_cycle_time) {
      return res.status(400).json({ error: 'machine_id and actual_cycle_time are required' });
    }
    
    const machine = await Machine.findByPk(machine_id, {
      include: [{ model: MachineSpec, as: 'spec' }]
    });
    
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const efficiency = calculateEfficiency(machine.spec || {}, actual_cycle_time);
    
    res.json({
      machine: {
        id: machine.id,
        name: machine.name,
        tonnage: machine.tonnage
      },
      spec: machine.spec,
      actual_cycle_time,
      ideal_cycle_time: machine.spec?.dry_cycle_time_sec || 30,
      efficiency: Math.round(efficiency * 100) / 100,
      status: efficiency >= 80 ? 'optimal' : efficiency >= 60 ? 'good' : 'needs_improvement'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Factory layout optimization
router.get('/layout', auth, async (req, res) => {
  try {
    const machines = await Machine.findAll({
      include: [{ model: MachineSpec, as: 'spec' }]
    });
    
    const layout = optimizeFactoryLayout(machines.map(m => ({
      ...m.toJSON(),
      spec: m.spec
    })));
    
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Production simulation
router.post('/simulate', auth, async (req, res) => {
  try {
    const { machine_id, mold_id, working_hours } = req.body;
    
    const machine = await Machine.findByPk(machine_id, {
      include: [{ model: MachineSpec, as: 'spec' }]
    });
    
    const mold = await Mold.findByPk(mold_id);
    
    if (!machine || !mold) {
      return res.status(404).json({ error: 'Machine or mold not found' });
    }
    
    const result = simulateProduction(
      { ...machine.toJSON(), spec: machine.spec },
      mold,
      working_hours || 8
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints (keeping for backward compatibility)
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { material, tonnage, machine_model } = req.query;
    
    const params = await OptimalParameter.findAll({
      where: {
        material: material || 'PP',
        ...(tonnage && {
          tonnage_min: { [Op.lte]: parseInt(tonnage) },
          tonnage_max: { [Op.gte]: parseInt(tonnage) }
        })
      }
    });
    
    if (params.length === 0) {
      return res.json({
        recommendations: [{
          material: material || 'PP',
          injection_temp: 220,
          mold_temp: 25,
          injection_speed: 50,
          holding_pressure: 100,
          cooling_time: 10,
          confidence: 'low'
        }]
      });
    }
    
    res.json({
      recommendations: params.map(p => ({
        material: p.material,
        injection_temp: (p.injection_temp_min + p.injection_temp_max) / 2,
        mold_temp: (p.mold_temp_min + p.mold_temp_max) / 2,
        injection_speed: p.injection_speed,
        holding_pressure: p.holding_pressure,
        cooling_time: p.cooling_time,
        confidence: 'high'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/machine-suitability', auth, async (req, res) => {
  try {
    const { tonnage, material } = req.query;
    
    const machines = await Machine.findAll({
      where: {
        tonnage: { [Op.gte]: parseInt(tonnage) || 0 }
      }
    });
    
    const molds = await Mold.findAll({
      where: {
        machine_tonnage_max: { [Op.gte]: parseInt(tonnage) || 0 }
      }
    });
    
    res.json({
      suitable_machines: machines,
      compatible_molds: molds,
      message: `Found ${machines.length} machines and ${molds.length} molds suitable for ${tonnage}T - ${material}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/maintenance-prediction', auth, async (req, res) => {
  try {
    const { machine_id } = req.query;
    
    const machine = await Machine.findByPk(machine_id);
    
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const lastMaintenance = machine.last_maintenance ? new Date(machine.last_maintenance) : new Date();
    const daysSinceMaintenance = Math.floor((new Date() - lastMaintenance) / (1000 * 60 * 60 * 24));
    
    let status = 'good';
    let message = 'Machine is in good condition';
    let risk_level = 'low';
    
    if (daysSinceMaintenance > 90) {
      status = 'warning';
      message = 'Maintenance overdue - over 90 days since last maintenance';
      risk_level = 'high';
    } else if (daysSinceMaintenance > 60) {
      status = 'warning';
      message = 'Maintenance recommended - 60+ days since last maintenance';
      risk_level = 'medium';
    }
    
    res.json({
      machine_id,
      status,
      message,
      risk_level,
      days_since_maintenance: daysSinceMaintenance,
      next_maintenance_recommended: daysSinceMaintenance >= 60
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/defect-detection', auth, async (req, res) => {
  try {
    res.json({
      status: 'simulated',
      message: 'AI defect detection is in demo mode',
      detected_defects: [],
      confidence: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/find-compatible-machines', auth, async (req, res) => {
  try {
    const { mold_id } = req.query;
    
    if (!mold_id) {
      return res.status(400).json({ error: 'mold_id is required' });
    }
    
    const mold = await Mold.findByPk(mold_id);
    
    if (!mold) {
      return res.status(404).json({ error: 'Mold not found' });
    }
    
    const machines = await Machine.findAll({
      where: {
        ...(mold.machine_tonnage_min && { tonnage: { [Op.gte]: mold.machine_tonnage_min } }),
        ...(mold.machine_tonnage_max && { tonnage: { [Op.lte]: mold.machine_tonnage_max } }),
        status: { [Op.ne]: 'broken' }
      },
      order: [['tonnage', 'ASC']]
    });
    
    const machinesWithScore = machines.map(machine => {
      const score = calculateCompatibilityScore(machine, mold);
      return {
        ...machine.toJSON(),
        compatibility_score: score,
        match_reason: getMatchReason(machine, mold)
      };
    });
    
    machinesWithScore.sort((a, b) => b.compatibility_score - a.compatibility_score);
    
    res.json({
      mold: {
        id: mold.id,
        code: mold.code,
        product_name: mold.product_name,
        material: mold.material,
        tonnage_min: mold.machine_tonnage_min,
        tonnage_max: mold.machine_tonnage_max
      },
      compatible_machines: machinesWithScore,
      total_found: machinesWithScore.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateCompatibilityScore(machine, mold) {
  let score = 100;
  
  if (machine.tonnage < mold.machine_tonnage_min) {
    score -= 50;
  } else if (machine.tonnage > mold.machine_tonnage_max) {
    score -= 30;
  }
  
  if (machine.status === 'maintenance') score -= 20;
  if (machine.status === 'idle') score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function getMatchReason(machine, mold) {
  const reasons = [];
  
  if (machine.tonnage >= mold.machine_tonnage_min && machine.tonnage <= mold.machine_tonnage_max) {
    reasons.push('Tonnage within mold range');
  } else if (machine.tonnage < mold.machine_tonnage_min) {
    reasons.push('Tonnage below mold minimum - may be underpowered');
  } else {
    reasons.push('Tonnage above mold maximum - may be oversized');
  }
  
  if (machine.status === 'running') reasons.push('Currently running');
  else if (machine.status === 'idle') reasons.push('Available for immediate use');
  else if (machine.status === 'maintenance') reasons.push('In maintenance');
  
  return reasons.join(', ');
}

module.exports = router;