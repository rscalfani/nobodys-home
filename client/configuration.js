var changePassword = require('./changePassword');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var simulatorLoaded = false;
var automationLoaded = false;
var emptyRow;
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

	$('#webServer input[type="submit"]').click(function(event) {
		event.preventDefault();
		changePassword.show();
	});

	emptyRow = $('.table tbody tr:first-child').clone();

	numberTable();

	$('#addButton').click(function() {
		for (var i = 0; i < 3; ++i)
			addRow();
		numberTable();
	});

	$('#simulator input[type="submit"]').click(function(event) {
		event.preventDefault();
		var controllers = [];
		$('#simulatorForm tbody tr').each(function() {
			var controller = {};
			$(this).find('td input').each(function() {
				controller[$(this).attr('name')] = $(this).val();
			});
			controllers.push(controller);
		});

		$.ajax({
			url: '/api',
			type :'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				func: 'saveSimulator',
				configuration: {
					controllers: controllers
				}
			})
		});
		simulatorLoaded = false;
	});

	$('#automation input[type="submit"]').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: '/api',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				func: 'saveAutomation',
				configuration: {
					startHour: $('#startHour').val(),
					startMinutes: $('#startMinutes').val(),
					endHour: $('#endHour').val(),
					endMinutes: $('#endMinutes').val(),
					start: $('#startSelect').val(),
					end: $('#endSelect').val(),
					hardware: $('#hardwareSelect').val()
				}
			})
		});
		automationLoaded = false;
	});
};

var loadSimulator = function() {
	if (simulatorLoaded == false) {
		$.ajax({
			url: '/api',
			type :'POST',
			contentType: 'application/json',
			data: JSON.stringify({func: 'loadSimulator'})
		})
		.then(function(result) {
			result = JSON.parse(result);
			$('#simulatorForm > .table > tbody  > tr').remove();
			result.configuration.controllers.forEach(function(controller) {
				addRow();
				$('#simulatorForm > .table > tbody  > tr:last-child > td > input').each(function() {
					$(this).val(controller[$(this).attr('name')]);
				});
			});
			numberTable();
			simulatorLoaded = true;
			console.log('simulatorLoaded: ' + simulatorLoaded);
		});
	}
};

var loadAutomation = function() {
	if (automationLoaded == false) {
		$.ajax({
			url: '/api',
			type :'POST',
			contentType: 'application/json',
			data: JSON.stringify({func: 'loadAutomation'})
		})
		.then(function(result) {
			result = JSON.parse(result);
			$('#startHour').val(result.configuration.startHour);
			$('#startMinutes').val(result.configuration.startMinutes);
			$('#endHour').val(result.configuration.endHour);
			$('#endMinutes').val(result.configuration.endMinutes);
			$('#startSelect').val(result.configuration.start);
			$('#endSelect').val(result.configuration.end);
			$('#hardwareSelect').val(result.configuration.hardware);
		});
		automationLoaded = true;
		console.log('automationLoaded: ' + automationLoaded);
	}
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createConfigurationHandlers();
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
	show: show
};