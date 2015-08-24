var config = require('./config');
var ws = require('./ws')(config);

ws.start();