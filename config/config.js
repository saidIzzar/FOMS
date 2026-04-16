module.exports = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'foms-secret-key-2026',
  JWT_EXPIRES_IN: '24h',
  DB: './foms.db'
};