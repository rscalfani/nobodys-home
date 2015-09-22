var director = require('./bower_components/director');
var fs = require('fs');
var Handlebars = require('handlebars');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var changePassword = require('./changePassword');
var configuration = require('./configuration');
var login = require('./login');

Handlebars.registerPartial('loginBox', fs.readFileSync('loginBox.html').toString());
Handlebars.registerPartial('resetPasswordCodeModal', fs.readFileSync('resetPasswordCodeModal.html').toString());
Handlebars.registerPartial('changePasswordModal', fs.readFileSync('changePasswordModal.html').toString());
Handlebars.registerPartial('configuration', fs.readFileSync('configuration.html').toString());

var template = fs.readFileSync('template.html').toString();
var compiledTemplate = Handlebars.compile(template);

$('document').ready(function() {
	//populate DOM
	$('#template').html(compiledTemplate());
	//initialize modules
	login.init();
	changePassword.init();
	configuration.init();
	login.clear();

	//initialize router
	var hideEverything = function() {
		$('.screen').hide();
		$('.modal').modal('hide');
	};

	var goToHomepage = function() {
		hideEverything();
		$('#loginBox').show();
	};

	var goToConfig = function() {
		hideEverything();
		configuration.show();
	};

	var routes = {
		'': goToHomepage,
		'webServer': goToConfig,
		'simulator': goToConfig,
		'automation': goToConfig
	};

	var router = Router(routes);

	router.configure({
		notfound: function() {
			window.location = 'main.html';
		}
	});

	router.init();

	//default to homepage
	if (window.location.hash == '')
		goToHomepage();
});