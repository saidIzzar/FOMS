const http = require('http');

const login = () => new Promise((resolve) => {
  const data = JSON.stringify({ username: 'admin', password: 'admin123' });
  const req = http.request({
    hostname: 'localhost', port: 8000, path: '/api/auth/token',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => resolve(JSON.parse(body).access));
  });
  req.write(data);
  req.end();
});

const request = (method, path, body = null) => new Promise((resolve) => {
  const req = http.request({
    hostname: 'localhost', port: 8000, path: path, method: method,
    headers: { 
      'Authorization': `Bearer ${global.token}`, 
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, data: data.substring(0, 200) }));
  });
  if (body) req.write(body);
  req.end();
});

(async () => {
  global.token = await login();
  console.log('Token:', global.token.substring(0, 20) + '...');
  
  const r = await request('POST', '/api/machines', JSON.stringify({ name: 'TEST', tonnage: 100 }));
  console.log('Create:', r.status, r.data);
})();