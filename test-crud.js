const http = require('http');

let token = '';

function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: 'admin', password: 'admin123' });
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const json = JSON.parse(body);
        if (json.access) {
          token = json.access;
          resolve(json.access);
        } else {
          reject(new Error('Login failed'));
        }
      });
    });
    req.write(data);
    req.end();
  });
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function testCRUD() {
  console.log('=== CRUD TESTS ===\n');
  
  await login();
  console.log('✓ Login successful\n');
  
  // CREATE machine
  const createResult = await request('POST', '/api/machines', JSON.stringify({
    name: 'TEST-MACHINE',
    model: 'Test Model',
    serial_number: 'TEST001',
    manufacturer: 'Test',
    tonnage: 100,
    status: 'idle'
  }));
  console.log(`CREATE Machine: ${createResult.status === 201 ? '✓ PASS' : '✗ FAIL'} (${createResult.status})`);
  const machineId = createResult.data.id;
  
  // READ machine
  const readResult = await request('GET', `/api/machines/${machineId}`);
  console.log(`READ Machine: ${readResult.status === 200 ? '✓ PASS' : '✗ FAIL'} (${readResult.status})`);
  
  // UPDATE machine
  const updateResult = await request('PATCH', `/api/machines/${machineId}`, JSON.stringify({
    status: 'running'
  }));
  console.log(`UPDATE Machine: ${updateResult.status === 200 ? '✓ PASS' : '✗ FAIL'} (${updateResult.status})`);
  
  // CREATE mold
  const createMoldResult = await request('POST', '/api/molds', JSON.stringify({
    code: 'TEST-MOLD',
    product_name: 'Test Product',
    material: 'PP',
    status: 'active'
  }));
  console.log(`CREATE Mold: ${createMoldResult.status === 201 ? '✓ PASS' : '✗ FAIL'} (${createMoldResult.status})`);
  const moldId = createMoldResult.data.id;
  
  // DELETE machine
  const deleteResult = await request('DELETE', `/api/machines/${machineId}`);
  console.log(`DELETE Machine: ${deleteResult.status === 204 ? '✓ PASS' : '✗ FAIL'} (${deleteResult.status})`);
  
  // DELETE mold
  const deleteMoldResult = await request('DELETE', `/api/molds/${moldId}`);
  console.log(`DELETE Mold: ${deleteMoldResult.status === 204 ? '✓ PASS' : '✗ FAIL'} (${deleteMoldResult.status})`);
  
  console.log('\n=== CRUD COMPLETE ===');
}

testCRUD().catch(console.error);