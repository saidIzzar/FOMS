const http = require('http');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2Mjc0MDcyLCJleHAiOjE3NzYzNjA0NzJ9.Net4kSInAc6rfSJLiX2-cKtPWmVzhmLLIixW3GUIh_4';

const endpoints = [
  '/api/machines',
  '/api/molds',
  '/api/accounts',
  '/api/production',
  '/api/maintenance',
  '/api/materials/suppliers'
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ path, status: res.statusCode, count: Array.isArray(json) ? json.length : 'N/A' });
        } catch (e) {
          resolve({ path, status: res.statusCode, error: e.message });
        }
      });
    });

    req.on('error', () => resolve({ path, error: 'failed' }));
    req.end();
  });
}

async function runTests() {
  console.log('=== API ENDPOINTS TEST ===');
  for (const ep of endpoints) {
    const result = await testEndpoint(ep);
    console.log(`${result.status === 200 ? '✓' : '✗'} ${ep} (${result.status}) => ${result.count || result.error || ''}`);
  }
}

runTests();