/*
 * Hello World RESTfulAPI
 * Assignment #1
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const cluster = require('cluster');
const numOfCPUs = require('os').cpus().length;

// Instantiate the HTTP server
// The server should respond to all requests with a string
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// All the server logic of the HTTP server
const unifiedServer = (req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string of an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toUpperCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    // Choose the handler this request should go to. If one is not found, use the notFound handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path
      console.log("Returning this response: ", statusCode, payloadString, `process id is: ${process.pid}`);
    });
  });
};

// Checks if we're in the master thread
if(cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork the process
  for(let i = 0; i < numOfCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share this HTTP server
  // Start the HTTP server
  httpServer.listen(config.httpPort, () => {
    console.log("The HTTP server is listening on port "+config.httpPort+" in "+config.envName+" mode");
  });
  console.log(`Worker ${process.pid} started`);
}


// Define the handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Hello handler with the payload
handlers.hello = (data, callback) => {
  callback(200, {message : 'Welcome to the first homework assignment on the NodeJS Master Class'});
};

// NotFound handler
handlers.notFound = (data, callback) => {
  callback(404, {message : 'File Not Found, Sorry!'});
};

// Define the router
const router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello
};
