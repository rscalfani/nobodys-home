var co = require('co');
var crypto = require('crypto');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var R = require('ramda');

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
			if (err.code == 'ENOENT') {
				return defaultPasswordHash;
			}
			throw err;
		}
	});

	var setPasswordHash = co.wrap(function* (newPassword) {
		yield pfs.writeFileAsync(config.ws.passwordLoc, hash(newPassword));
	});

	var getCode = co.wrap(function*() {
		return yield pfs.readFileAsync(config.ws.codeLoc);
	});

	var setCode = co.wrap(function* (code) {
		yield pfs.writeFileAsync(config.ws.codeLoc, code);
	});

	return {
		login: co.wrap(function*(loginObj) {
			try {
				var passwordHash = yield getPasswordHash();
				var loginPasswordHash = hash(loginObj.password);
				return {
					auth: loginPasswordHash == passwordHash && loginObj.username == 'admin',
					changePassword: loginPasswordHash == defaultPasswordHash
				};
			}
			catch(err) {
				return {err: err.message};
			}
		}),
		changePassword: co.wrap(function*(changePasswordObj) {
			try {
				var err = {};
				if (hash(changePasswordObj.newPassword) == defaultPasswordHash)
					err.invalidNewPassword = true;
				if ((yield getPasswordHash()) != hash(changePasswordObj.oldPassword))
					err.invalidOldPassword = true;
				if (Object.keys(err).length != 0)
					return err;
				yield setPasswordHash(changePasswordObj.newPassword);
				return {
					passwordChanged: true
				};
			}
			catch(err) {
				return {err: err.message};
			}
		}),
		generateResetPasswordCode: co.wrap(function*(generateObj) {
			try {
				var randomizeThree = function() {
					var randomThree = '';
					for (var i = 0; i < 3; ++i)
						randomThree += R.toUpper(Math.random().toString(36).substr(2, 1));
					return randomThree;
				};
				var resetPasswordCode = [];
				for (var i = 0; i < 3; ++i)
					resetPasswordCode.push(randomizeThree());
				var code = R.join('-', resetPasswordCode);
				yield setCode(R.replace(/-/g, '', code));
				return {
					code: code
				};
			}
			catch(err) {
				return {err: err.message};
			}
		}),
		getResetPasswordCode: co.wrap(function*(getObj) {
			try {
				var code = (yield getCode()).toString();
				if (getObj.code.toUpperCase() == code.toUpperCase()) {
					try {
						yield pfs.unlinkAsync(config.ws.passwordLoc);
					}
					catch(err) {
						if (err.code != 'ENOENT') {
							return {err: err.message};
						}
					}
					return {
						passwordReset: true
					}
				}
				return {
					passwordReset: false
				};
			}
			catch(err) {
				return {err: err.message};
			}
		})
	}
};