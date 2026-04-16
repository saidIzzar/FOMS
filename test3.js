const http = require('http');

const loginAndRequest = () => {
  const postData = JSON.stringify({ username: 'admin', password: 'admin123' });
  
  const loginReq = http.request({
    hostname: 'localhost', port: 8000, path: '/api/auth/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
  }, (loginRes) => {
    let body = '';
    loginRes.on('data', c => body += c);
    loginRes.on('end', () => {
      const token = JSON.parse(body).access;
      console.log('✓ Login OK, token received');
      
      const createReq = http.request({
        hostname: 'localhost', port: 8000, path: '/api/machines',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': 30
        }
      }, (createRes) => {
        let createBody = '';
        createRes.on('data', c => createBody += c);
        createRes.on('end', () => {
          console.log('Create Machine:', createRes.statusCode);
          console.log(createBody);
        });
      });
      createReq.write('{"name":"TEST","tonnage":100}');
      createReq.end();
    });
  });
  loginReq.write(postData);
  loginReq.end();
};

loginAndRequest();