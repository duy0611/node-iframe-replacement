var path = require('path'),
  express = require('express'),
  exphbs = require('express-handlebars'),
  iframeReplacement = require('../index.js');

var http = require('http'),
  https = require('https');

var fs = require('fs');

var bodyParser = require('body-parser');
var request = require('request');


function Server() {

  if (process.argv.length != 6) {
    console.log('Not enough argumets (require 5): node example/server.js <SERVER_NAME:localhost> <SERVER_PORT:12345> <TARGET_SERVER_URL:http://localhost:8001> <ENABLE_HTTPS:TRUE:FALSE>');
    process.exit();
  }

  process.env.SERVER_NAME = process.argv[2];
  process.env.SERVER_PORT = process.argv[3];
  process.env.TARGET_SERVER_URL = process.argv[4];
  process.env.ENABLE_HTTPS = process.argv[5];

  var enableHttps = process.env.ENABLE_HTTPS == 'TRUE' ? true : false;

  // create an instance of express
  var app = express();

  // add iframe replacement to express as middleware (adds res.merge method)
  app.use(iframeReplacement);

  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({
    extended: true
  })); // for parsing application/x-www-form-urlencoded

  // add handlebars view engine (you can use any)
  app.engine('hbs', exphbs());

  // let express know how to locate the views/templates
  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'hbs');

  // create simple route to test our fake news
  app.get('/proxy', function(req, res) {

    // respond to this request with our fake-new content embedded within the BBC News home page
    res.merge('fake-drag-drop-bar', {
      sourceUrl: req.query.url, // external url to fetch
      sourcePlaceholder: 'div[id="fake-collection-bar"]' // css selector to inject our content into
    });
  });

  app.post('/proxy', function(req, res) {

    var headers = {
      'X-Requested-With': 'XMLHttpRequest'
    };

    console.log(req.body);

    var options = {
      url: req.query.url,
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body)
    };

    request(options, function(err, response, body) {
      res.end(body);
    });
  });

  app.post('/redirect', function(req, res) {
    res.redirect(301, req.query.url);
  });

  // create simple route to test our fake news
  app.get('/load', function(req, res) {

    var filePath = '../config/' + req.query.file;

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
    }

    fs.readFile(path.join(__dirname, filePath), function(error, content) {

      if (error) {
        if (error.code == 'ENOENT') {
          fs.readFile('./404.html', function(error, content) {
            res.writeHead(200, {
              'Content-Type': contentType
            });
            res.end(content, 'utf-8');
          });
        } else {
          res.writeHead(500);
          res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
          res.end();
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType
        });
        res.end(content, 'utf-8');
      }
    });

  });

  // start the server
  if (enableHttps) {
    var options = {
      key: fs.readFileSync('/home/node/ssl/server-self.key'),
      cert: fs.readFileSync('/home/node/ssl/server-self.crt')
    };

    https.createServer(options, app).listen(process.env.SERVER_PORT, function() {
      console.log('Server running... Visit https://' + process.env.SERVER_NAME + ':' + process.env.SERVER_PORT + ' in your browser');
    });
  } else {
    http.createServer(app).listen(process.env.SERVER_PORT, function() {
      console.log('Server running... Visit http://' + process.env.SERVER_NAME + ':' + process.env.SERVER_PORT + ' in your browser');
    });
  }
}

module.exports = new Server();
