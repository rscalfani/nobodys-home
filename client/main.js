var login = require('./login');
var changePassword = require('./changePassword');

$(function() {
	login.init();
	changePassword.init();
	login.show();
});

