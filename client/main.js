var fs = require('fs');
var Handlebars = require('handlebars');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var login = require('./login');
var changePassword = require('./changePassword');

Handlebars.registerPartial('loginBox', fs.readFileSync('loginBox.html').toString());
Handlebars.registerPartial('changePasswordModal', fs.readFileSync('changePasswordModal.html').toString());
Handlebars.registerPartial('resetPasswordCodeModal', fs.readFileSync('resetPasswordCodeModal.html').toString());

var template = fs.readFileSync('template.html').toString();
var compiledTemplate = Handlebars.compile(template);

$(function() {
	$('#template').html(compiledTemplate());
	login.init();
	changePassword.init();
	login.show();
});