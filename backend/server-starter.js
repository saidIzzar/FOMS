const { spawn } = require('child_process');
const path = require('path');

console.log('Starting FOMS MES Backend...');

const server = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
});