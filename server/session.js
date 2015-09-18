var R = require('ramda');
var uuidMod = require('node-uuid');

var sessions = {};

var deleteOldSessions = function() {
	R.forEach(function(uuid) {
		if (sessions[uuid].expirationDate < Date.now())
			delete sessions[uuid];
	}, R.keys(sessions));
};

var session = {
	createSessionCookie: function() {
		deleteOldSessions();
		var uuid = uuidMod.v4();
		sessions[uuid] = {expirationDate: Date.now() + 86400000};
		return uuid;
	},
	checkSession: function(req) {
		deleteOldSessions();
		console.log('cookie:' , req.headers.cookie);
		console.log('session:' , sessions[req.headers.cookie]);
		return sessions[req.headers.cookie];
	},
	deleteSession: function(req) {
		console.log('this session', sessions[req.headers.cookie]);
		delete sessions[req.headers.cookie];
	}
};

module.exports = session;