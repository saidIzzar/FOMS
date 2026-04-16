const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const moldRoutes = require('./routes/molds');
const userRoutes = require('./routes/users');
const productionRoutes = require('./routes/production');
const maintenanceRoutes = require('./routes/maintenance');
const materialsRoutes = require('./routes/materials');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/molds', moldRoutes);
app.use('/api/accounts', userRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FOMS API is running' });
});

// Check if request is for API
const isApiRequest = (reqPath) => {
  return reqPath.startsWith('/api/') || reqPath === '/api';
};

// Serve static files
app.use(express.static(FRONTEND_DIST));

// Serve index.html for all non-API requests
app.use((req, res) => {
  if (isApiRequest(req.path)) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(FRONTEND_DIST, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`FOMS Backend running on http://localhost:${PORT}`);
});