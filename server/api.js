var co = require('co');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));

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
		})
	}
};