var config = require('./config');
var ws = require('./ws')(config);

ws.start();

var getExit = function(sigType) {
	return function() {
		console.log('exiting, received: ' + sigType); //TODO log to file
		ws.stop();
		process.exit(1);
	};
};

process.on('SIGINT', getExit('SIGINT'));
process.on('SIGTERM', getExit('SIGTERM'));