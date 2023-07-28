const http = require('http');
const services = require('../services');
const url = require('url');
const jsonBody = require('body/json');
const fs = require('fs');
const formidable = require('formidable');

const server = http.createServer();

server.on('request', (request, response) => {
  request.on('error', (err) => {
    console.log(`request error ${err}`);
  });
  response.on('error', (err) => {
    console.log(`response error ${err}`);
  });
  const parsedUrl = url.parse(request.url, true);
  if (request.method === 'GET' && parsedUrl.pathname === '/metadata') {
    const { id } = parsedUrl.query;
    const metadata = services.fetchImageMetadata(id);
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = 200;
    const serializedJSON = JSON.stringify(metadata);
    response.write(serializedJSON);
    response.end();
  } else if (request.methpd === 'POST' && parsedUrl.pathname === '/users') {
    jsonBody(request, response, (err, body) => {
      if (err) {
        console.log(err);
      } else {
        services.createUser(body['userName']);
      }
    });
  } else if (request.method === 'POST' && parsedUrl.pathname === '/upload') {
    const form = new formidable.IncomingForm({
      uploadDir: __dirname,
      keepExtensions: true,
      multiples: true,
      maxFileSize: 5 * 1024 * 1024,
      encoding: 'utf-8',
    });

    form
      .parse(request)
      .on('fileBegin', (name, file) => {
        console.log('Our upload has started!');
      })
      .on('file', (name, file) => {
        console.log('Field + file pair has been received');
      })
      .on('field', (name, value) => {
        console.log('Field Received:');
        console.log(name, value);
      })
      .on('progress', (bytesReceived, bytesExpected) => {
        console.log(`${bytesReceived} / ${bytesExpected}`);
      })
      .on('error', (err) => {
        console.log(err);
        request.resume();
        response.statusCode = 500;
        response.end('Error!');
      })
      .on('aborted', () => {
        console.log('Request aborted by the user');
      })
      .on('end', () => {
        console.log('Done - request received!');
        response.statusCode = 200;
        response.end('Success!');
      });
    // form.parse(request, (err, fields, files) => {
    //   if (err) {
    //     console.log(err);
    //     response.statusCode = 500;
    //     response.end('Error!');
    //   }
    //   console.log(files);
    //   response.statusCode = 200;
    //   response.end('Success!');
    // });
  } else {
    fs.createReadStream('./index.html').pipe(response);
  }
});

server.listen(8080);
