var co = require('co');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var R = require('ramda');

module.exports = function(config) {
	var getPassword = co.wrap(function*() {
		try {
			return yield pfs.readFileAsync(config.ws.passwordLoc);
		}
		catch(err) {
			if (err.code == 'ENOENT') {
				yield setPassword('password');
				return 'password';
			}
			throw err;
		}
	});

	var setPassword = co.wrap(function* (newPassword) {
		yield pfs.writeFileAsync(config.ws.passwordLoc, newPassword);
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
				var password = yield getPassword();
				return {
					auth: loginObj.password == password && loginObj.username == 'admin',
					changePassword: loginObj.password == 'password'
				};
			}
			catch(err) {
				return {err: err.message};
			}
		}),
		changePassword: co.wrap(function*(changePasswordObj) {
			try {
				var err = {};
				if (changePasswordObj.newPassword == 'password')
					err.invalidNewPassword = true;
				if ((yield getPassword()) != changePasswordObj.oldPassword)
					err.invalidOldPassword = true;
				if (Object.keys(err).length != 0)
					return err;
				yield setPassword(changePasswordObj.newPassword);
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
				yield setCode(R.replace('-', '', code));
				return {
					code: code
				};
			}
			catch(err) {
				return {err: err.message};
			}
		})
	}
};