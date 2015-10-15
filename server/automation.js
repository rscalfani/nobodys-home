var co = require('co');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));

module.exports = function(config) {
	var automationConfig;
	var runningTime;

	var to24Hours = function(time, ampm) {
		if (ampm == 'AM' && time == 12)
			time = 0;
		else if (ampm == 'PM' && time != 12)
			time = Number(time) + 12;
		return time;
	};

	var automation = {
		loadAutomationConfig: co.wrap(function*() {
			automationConfig = JSON.parse(yield pfs.readFileAsync(config.ws.automationLoc));
		}),
		getRunningTime: function() {
			var startHour = automationConfig.configuration.startHour;
			var endHour = automationConfig.configuration.endHour;
			var startMinutes = automationConfig.configuration.startMinutes;
			var endMinutes = automationConfig.configuration.endMinutes;

			//convert to 24 hour clock
			startHour = to24Hours(startHour, automationConfig.configuration.startAmpm);
			endHour = to24Hours(endHour, automationConfig.configuration.endAmpm);

			//handle special case where end is before start
			if (endHour < startHour)
				endHour = Number(endHour) + 24;

			// calculate running time in minutes
			runningTime = (endHour - startHour) * 60 + (endMinutes - startMinutes);
			if (runningTime == 0)
				runningTime = 24 * 60;
			return runningTime;
		},
		init: co.wrap(function*() {
			yield automation.loadAutomationConfig();
			console.log('running time: ' + automation.getRunningTime() + ' minutes');
		})
	};
	return automation;
};