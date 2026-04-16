const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/token/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Response body:', JSON.stringify(json, null, 2));
      if (res.statusCode === 200 && json.access) {
        console.log('Login Test: SUCCESS');
      } else {
        console.log('Login Test: FAILED');
      }
    } catch (e) {
      console.log('Raw body:', body);
      console.log('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end();
