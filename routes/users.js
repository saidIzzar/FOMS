const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['username', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { username, password, email, first_name, last_name, role, department, position, branch } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      first_name,
      last_name,
      role: role || 'operator',
      department,
      position,
      branch
    });
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department,
      position: user.position,
      branch: user.branch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', requireRole('admin', 'engineer'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...updates } = req.body;
    
    if (password) {
      const bcrypt = require('bcryptjs');
      updates.password = await bcrypt.hash(password, 10);
    }
    
    await user.update(updates);
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department,
      position: user.position,
      branch: user.branch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;