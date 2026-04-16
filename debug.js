const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/machines/1',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2Mjc0MDcyLCJleHAiOjE3NzYzNjA0NzJ9.Net4kSInAc6rfSJLiX2-cKtPWmVzhmLLIixW3GUIh_4'
  }
};

http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body.substring(0, 300));
  });
}).end();