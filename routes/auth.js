const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('../config/config');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

router.post('/token', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await User.findOne({ where: { username } });
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
    
    res.json({
      access: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department,
        position: user.position,
        branch: user.branch,
        language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id, role: req.user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
    res.json({ access: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

router.patch('/me/', auth, async (req, res) => {
  try {
    const allowedFields = ['email', 'first_name', 'last_name', 'department', 'position', 'branch', 'language'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    await req.user.update(updates);
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, role } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      first_name,
      last_name,
      role: role || 'operator'
    });
    
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
    
    res.status(201).json({
      access: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;