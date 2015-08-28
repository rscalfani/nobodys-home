var co = require('co');
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

module.exports = function(config) {
	var api = require('./api')(config);
	var server;
	return {
		start: function() {
			server = http.createServer(function(req, res) {
				var pathName = url.parse(req.url).pathname;
				if (req.method == 'GET') {
					if (pathName == '/') {
						res.statusCode = 301;
						res.setHeader('location', '/main.html');
						res.end();
						return;
					}
					fs.readFile(path.join('../client/', pathName), 'utf8', function(err, data) {
						if (err) {
							console.log(err);
							res.statusCode = 404;
						}
						else {
							res.write(data);
							res.statusCode = 200;
						}
						res.end();
					});
				}
				else if (req.method == 'POST' && pathName == '/api') {
					var body = '';
					req.on('data', function(chunk) {
						body += chunk;
					});
					req.on('end', co.wrap(function*() {
						var apiObj = JSON.parse(body);
						res.setHeader('Content-Type', 'application/json');
						if(api[apiObj.func])
							res.write(JSON.stringify(yield api[apiObj.func](apiObj)));
						else
							res.write(JSON.stringify({err: 'function does not exist'}));
						res.end();
					}));
				}
				else {
					res.statusCode = 404;
					res.end();
				}
			});
			server.listen(8080, function() {
				console.log('server is running');
			});
		},
		stop: function() {
			//TODO write
		}
	};
};