const https = require('https');
const services = require('../services');
const url = require('url');
const jsonBody = require('body/json');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
};
const server = https.createServer(options);

server.on('request', (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  if (request.method === 'GET' && parsedUrl.pathname === '/metadata') {
    const { id } = parsedUrl.query;
    const metadata = services.fetchImageMetadata(id);
    console.log(request.headers);
  }

  jsonBody(request, response, (err, body) => {
    if (err) {
      console.log(err);
    } else {
      services.createUser(body['userName']);
    }
  });
  response.end('THis was served with https!');

  // Without Library

  // const body = [];
  // request
  //   .on('data', (chunk) => {
  //     body.push(chunk);
  //   })
  //   .on('end', () => {
  //     const parsedJSON = JSON.parse(Buffer.concat(body));
  //     const userName = parsedJSON[0]['userName'];
  //     services.createUser(userName);
  //   });
});

server.listen(443);
