var director = require('./bower_components/director');
var fs = require('fs');
var Handlebars = require('handlebars');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var login = require('./login');
var changePassword = require('./changePassword');
var configuration = require('./configuration');

Handlebars.registerPartial('loginBox', fs.readFileSync('loginBox.html').toString());
Handlebars.registerPartial('changePasswordModal', fs.readFileSync('changePasswordModal.html').toString());
Handlebars.registerPartial('resetPasswordCodeModal', fs.readFileSync('resetPasswordCodeModal.html').toString());
Handlebars.registerPartial('configuration', fs.readFileSync('configuration.html').toString());

var template = fs.readFileSync('template.html').toString();
var compiledTemplate = Handlebars.compile(template);

$('document').ready(function() {
	$('#template').html(compiledTemplate());
	login.init();
	changePassword.init();
	configuration.init();
	login.clear();

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
		var tab = window.location.hash;
		$('a[href="' + tab + '"]').tab('show');
		$('#configuration').show();
	};

	var routes = {
		'webServer': goToConfig,
		'simulator': goToConfig,
		'automation': goToConfig
	};

	var router = Router(routes);

	router.configure({
		notfound: function() {
			alert('not found');
			window.location = 'main.html';
		},
		on: function() {
			console.log('found');
		}
	});

	router.init();

	if (window.location.hash == '')
		goToHomepage();
});