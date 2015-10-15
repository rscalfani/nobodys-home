var api = require('./api');
var changePassword = require('./changePassword');

var emptyRow;
var simulatorLoaded;
var automationLoaded;

var addRow = function() {
	$('.table tbody').append(emptyRow.clone());
};
var numberTable = function() {
	$('.table tbody tr td:first-child').each(function(index) {
		$(this).text(index + 1);
	});
};

var createConfigurationHandlers = function() {
	$('.nav-tabs a').click(function(){
		$(this).tab('show');
	});

	$('#webServer input[value="Change Password"]').click(function() {
		changePassword.show();
	});

	$('#webServer input[value="Logout"]').click(function() {
		$('#invalid').css('display', '');

		api({func: 'logout'})
		.then(function(result) {
			if (result.err) {
				alert(result.err);
				return;
			}
			window.location = '#';
		})
		.then(null, function(jqXHR, textStatus, errorThrown) {
			alert("Server Communication Error: " + jqXHR.statusText);
		});
	});

	$('#addButton').click(function() {
		for (var i = 0; i < 3; ++i)
			addRow();
		numberTable();
	});

	$('#simulator input[type="submit"]').click(function(event) {
		event.preventDefault();
		saveSimulator();
	});

	$('#automation input[type="submit"]').click(function(event) {
		event.preventDefault();
		saveAutomation();
	});
};

var loadSimulator = function() {
	if (!simulatorLoaded) {
		api({func: 'loadSimulator'})
		.then(function(result) {
			if (result.err) {
				alert(result.err);
				return;
			}

			if (result.configuration) {
				$('#simulatorForm > .table > tbody  > tr').remove();
				result.configuration.controllers.forEach(function(controller) {
					addRow();
					//for each column in the new row, insert controller values
					$('#simulatorForm > .table > tbody  > tr:last-child > td > input').each(function() {
						$(this).val(controller[$(this).attr('name')]);
					});
				});
			}
			numberTable();
			simulatorLoaded = true;
			//console.log('simulatorLoaded: ' + simulatorLoaded);
		})
		.then(null, function(jqXHR, textStatus, errorThrown) {
			alert("Server Communication Error: " + jqXHR.statusText);
		});
	}
};

var saveSimulator = function() {
	var controllers = [];
	$('#simulatorForm tbody tr').each(function() {
		var controller = {};
		$(this).find('td input').each(function() {
			if ($(this).val() != '')
				controller[$(this).attr('name')] = $(this).val().trim();
		});
		if (Object.keys(controller).length)
			controllers.push(controller);
	});
	
	var error = '';
	var valid = controllers.every(function(controller) {
		if (!controller.nodeId.match(/^\d+$/))
			error = 'Node ID must be a number';
		else if (!controller.cycles.match(/^\d+$/))
			error = 'Cycles must be a number';
		else if (!controller.minutes.match(/^\d+$/))
			error = 'Minutes must be a number';
		else if (controller.minutes >= 23 * 60)
			error = 'Minutes must be less than 23 hours';
		return error == '';
	});
	if (error != '') {
		$('#invalid').text(error);
		$('#invalid').css('display', 'block');
		return;
	}

	$('#invalid').css('display', '');

	api({
		func: 'saveSimulator',
		configuration: {
			controllers: controllers
		}
	})
	.then(function(result) {
		if (result.err) {
			alert(result.err);
			return;
		}
	})
	.then(null, function(jqXHR, textStatus, errorThrown) {
		alert("Server Communication Error: " + jqXHR.statusText);
	});
};

var loadAutomation = function() {
	if (!automationLoaded) {
		api({func: 'loadAutomation'})
		.then(function(result) {
			if (result.err) {
				alert(result.err);
				return;
			}

			if (result.configuration) {
				Object.keys(result.configuration).forEach(function(key) {
					$('#' + key).val(result.configuration[key]);
				});
			}
		})
		.then(null, function(jqXHR, textStatus, errorThrown) {
			alert("Server Communication Error: " + jqXHR.statusText);
		});
		automationLoaded = true;
		//console.log('automationLoaded: ' + automationLoaded);
	}
};

var saveAutomation = function() {
	var configuration = {};
	[	'startHour',
		'startMinutes',
		'endHour',
		'endMinutes',
		'startAmpm',
		'endAmpm'
		//'hardwareSelect'
	].forEach(function(id) {
			configuration[id] = $('#' + id).val();
		});
	api({
		func: 'saveAutomation',
		configuration: configuration
	})
	.then(function(result) {
		if (result.err) {
			alert(result.err);
			return;
		}
	})
	.then(null, function(jqXHR, textStatus, errorThrown) {
		alert("Server Communication Error: " + jqXHR.statusText);
	});
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createConfigurationHandlers();
	emptyRow = $('.table tbody tr:first-child').clone();
	numberTable();
};

var reset = function() {
	simulatorLoaded = false;
	automationLoaded = false;
};

var show = function() {
	document.title = 'Nobody\'s Home | Configuration';
	var tab = window.location.hash;
	$('a[href="' + tab + '"]').tab('show');
	loadSimulator();
	loadAutomation();
	$('#configuration').show();
};

module.exports = {
	init: init,
	reset: reset,
	show: show
};