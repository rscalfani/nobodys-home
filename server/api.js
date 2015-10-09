var co = require('co');
var crypto = require('crypto');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var R = require('ramda');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var session = require('./session');

var hash = function(text) {
	return crypto.createHmac('sha256', 'nobodyshome').update(text).digest('hex')
};

var defaultPasswordHash = hash('password');

module.exports = function(config) {
	var getPasswordHash = co.wrap(function*() {
		try {
			return yield pfs.readFileAsync(config.ws.passwordLoc);
		}
		catch(err) {
			//if file doesn't exist, then return default
			if (err.code == 'ENOENT') {
				return defaultPasswordHash;
			}
			throw err;
		}
	});

	var setPasswordHash = co.wrap(function* (newPassword) {
		yield pfs.writeFileAsync(config.ws.passwordLoc, hash(newPassword));
	});

	var getResetPasswordCode = co.wrap(function*() {
		return yield pfs.readFileAsync(config.ws.codeLoc);
	});

	var setResetPasswordCode = co.wrap(function* (code) {
		yield pfs.writeFileAsync(config.ws.codeLoc, code);
	});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return {
		login: co.wrap(function*(loginObj, req, res) {
			var passwordHash = yield getPasswordHash();
			var loginPasswordHash = hash(loginObj.password);
			var auth = loginPasswordHash == passwordHash && loginObj.username == 'admin';

			if (auth)
				res.setHeader('Set-Cookie', session.createSessionCookie());

			return {
				auth: auth,
				changePassword: loginPasswordHash == defaultPasswordHash
			};
		}),
		logout: co.wrap(function*(logoutObj, req) {
			session.deleteSession(req);
		}),
		changePassword: co.wrap(function*(changePasswordObj) {
			var err = {};
			//new password cannot be default
			if (hash(changePasswordObj.newPassword) == defaultPasswordHash)
				err.invalidNewPassword = true;
			//check if old password is correct
			if ((yield getPasswordHash()) != hash(changePasswordObj.oldPassword))
				err.invalidOldPassword = true;
			//return any errors
			if (Object.keys(err).length != 0)
				return err;
			//change password
			yield setPasswordHash(changePasswordObj.newPassword);
			return {
				passwordChanged: true
			};
		}),
		generateResetPasswordCode: co.wrap(function*() {
			var randomizeThree = function() {
				var randomThree = '';
				for (var i = 0; i < 3; ++i)
					randomThree += R.toUpper(Math.random().toString(36).substr(2, 1));
				return randomThree;
			};
			//generate reset password code
			var resetPasswordCode = [];
			for (var i = 0; i < 3; ++i)
				resetPasswordCode.push(randomizeThree());
			var code = R.join('-', resetPasswordCode);
			//save reset password code without dashes
			yield setResetPasswordCode(R.replace(/-/g, '', code));
			return {
				code: code
			};
		}),
		resetPassword: co.wrap(function*(resetObj) {
			var code = (yield getResetPasswordCode()).toString();
			if (resetObj.code.toUpperCase() == code.toUpperCase()) {
				//delete password file to use default password
				try {
					yield pfs.unlinkAsync(config.ws.passwordLoc);
				}
				catch(err) {
					//eat file does not exist
					if (err.code != 'ENOENT')
						throw err;
				}
				return {
					passwordReset: true
				}
			}
			return {
				passwordReset: false
			};
		}),
		loadSimulator: co.wrap(function*() {
			try {
				return JSON.parse((yield pfs.readFileAsync(config.ws.simulatorLoc)).toString());
			}
			catch(err) {
				if (err.code != 'ENOENT')
					throw err;
			}
		}),
		saveSimulator: co.wrap(function*(simulatorObj) {
			delete simulatorObj.func;
			yield pfs.writeFileAsync(config.ws.simulatorLoc, JSON.stringify(simulatorObj));
		}),
		loadAutomation: co.wrap(function*() {
			try {
				return JSON.parse((yield pfs.readFileAsync(config.ws.automationLoc)).toString());
			}
			catch(err) {
				if (err.code != 'ENOENT')
					throw err;
			}
		}),
		saveAutomation: co.wrap(function*(automationObj) {
			delete automationObj.func;
			yield pfs.writeFileAsync(config.ws.automationLoc, JSON.stringify(automationObj));
		})
	}
};