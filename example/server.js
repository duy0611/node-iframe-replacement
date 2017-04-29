var path = require('path'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    iframeReplacement = require('../index.js');

function Server() {
	
	if(process.argv.length != 5) {
		console.log('Not enough argumets (require 5): node example/server.js <SERVER_NAME:localhost> <SERVER_PORT:12345> <TARGET_SERVER_URL:http://localhost:8001>');
		process.exit();
	}
	
	process.env.SERVER_NAME = process.argv[2];
	process.env.SERVER_PORT = process.argv[3];
	process.env.TARGET_SERVER_URL = process.argv[4];

    // create an instance of express
    var app = express();

    // add iframe replacement to express as middleware (adds res.merge method)
    app.use(iframeReplacement);

    // add handlebars view engine (you can use any)
    app.engine('hbs', exphbs());

    // let express know how to locate the views/templates
    app.set('views', path.resolve(__dirname, 'views'));
    app.set('view engine', 'hbs');

    // create simple route to test our fake news
    app.get('/proxy', function(req, res) {

        // respond to this request with our fake-new content embedded within the BBC News home page
        res.merge('fake-drag-drop-bar', {
            sourceUrl: req.query.url,                             // external url to fetch
            sourcePlaceholder: 'div[id="fake-collection-bar"]'   // css selector to inject our content into
        });
    });
	
	

    // start the server
    app.listen(process.env.SERVER_PORT, function() {
        console.log('Server running... Visit http://' + process.env.SERVER_NAME + ':' + process.env.SERVER_PORT + ' in your browser');
    });
}

module.exports = new Server();