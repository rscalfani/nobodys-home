var co = require('co');
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var session = require('./session');

var redirect = function(res, path) {
	res.statusCode = 301;
	res.setHeader('location', path);
	res.end();
};

module.exports = function(config) {
	var api = require('./api')(config);
	var server;
	return {
		start: function() {
			server = http.createServer(function(req, res) {
				var pathName = url.parse(req.url).pathname;
				//static page handling
				if (req.method == 'GET') {
					//redirect to default path
					if (pathName == '/') {
						redirect(res, '/main.html');
						return;
					}
					//remove trailing slashes via redirect
					if (pathName.match(/\/$/)) {
						redirect(res, pathName.replace(/\/$/, ''));
						return;
					}
					//get resource from client folder
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
				//api handling
				else if (req.method == 'POST' && pathName == '/api') {
					var body = '';
					req.on('data', function(chunk) {
						body += chunk;
					});
					req.on('end', co.wrap(function*() {
						var apiObj = JSON.parse(body);
						res.setHeader('Content-Type', 'application/json');
						//check if requested function exists
						if(api[apiObj.func]) {
							//check for valid session (except for login & reset password)
							if (apiObj.func != 'login' && apiObj.func != 'resetPassword') {
								if(!session.checkSession(req)) {
									res.write(JSON.stringify({invalidSession: true}));
									res.end();
									return;
								}
							}
							//call API
							try {
								res.write(JSON.stringify((yield api[apiObj.func](apiObj, req, res)) || {}));
							}
							catch (err) {
								res.write(JSON.stringify({err: err.message}));
							}
						}
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
			server.listen(config.ws.port, function() {
				console.log('server is running'); //TODO log to file
			});
		},
		stop: function() {
			server.close;
		}
	};
};