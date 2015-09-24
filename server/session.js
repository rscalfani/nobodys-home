var R = require('ramda');
var uuidMod = require('node-uuid');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var config = require('./config');

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
		sessions[uuid] = {expirationDate: Date.now() + config.ws.sessionTimeout};
		return uuid;
	},
	checkSession: function(req) {
		deleteOldSessions();
		return sessions[req.headers.cookie];
	},
	deleteSession: function(req) {
		delete sessions[req.headers.cookie];
	}
};

module.exports = session;