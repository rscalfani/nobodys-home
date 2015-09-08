var changePassword = require('./changePassword');

var createConfigurationHandlers = function() {
	$('.nav-tabs a').click(function(){
		$(this).tab('show');
	});

	$('#webServer input[type="submit"]').click(function(event) {
		event.preventDefault();
		changePassword.show();
	});

	var numberTable = function() {
		$('.table tbody tr td:first-child').each(function(index) {
			$(this).text(index + 1);
		});
	};

	numberTable();

	var emptyRow = $('.table tbody tr:first-child').clone();

	$('#addButton').click(function() {
		for (var i = 0; i < 3; ++i)
			$('.table tbody').append(emptyRow.clone());
		numberTable();
	});
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createConfigurationHandlers();
};

var show = function() {
	//$('#configuration').show(); //TODO cleanup (& rename?)
	window.location = 'main.html#webServer';
	document.title = 'Nobody\'s Home | Configuration';
};

module.exports = {
	init: init,
	show: show
};