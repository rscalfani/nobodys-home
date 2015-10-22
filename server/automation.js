var co = require('co');
var OZW = require('../node-openzwave/lib/openzwave');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var zwave = new OZW('/dev/cu.SLAB_USBtoUART');
var time = require('./time');

module.exports = function(config) {
	var automationConfig;
	var runningTime;

	var homeId;
	var nodes = {};

	zwave.on('driver ready', function(homeid) {
		homeId = homeid;
		console.log('scanning ' + homeId);
	});

	zwave.on('driver failed', function() {
		console.log('failed to start driver');
		zwave.disconnect();
		process.exit(1);
	});

	zwave.on('node added', function(nodeid) {
		//the primary controller always has a nodeid = 1
		nodes[nodeid] = {
			manufacturer: '',
			manufacturerid: '',
			product: '',
			producttype: '',
			productid: '',
			type: '',
			name: '',
			loc: ''
		};
		console.log('added node: ' + nodeid);
	});

	var automation = {
		loadAutomationConfig: co.wrap(function*() {
			automationConfig = JSON.parse(yield pfs.readFileAsync(config.ws.automationLoc));
		}),
		getRunningTime: function() {
			var start = automation.getStartTime();
			var end = automation.getEndTime();

			//handle special case where end is before start
			if (end.hour < start.hour)
				end.hour = Number(end.hour) + 24;

			//calculate running time in minutes
			runningTime = (end.hour - start.hour) * 60 + (end.minutes - start.minutes);
			if (runningTime == 0)
				runningTime = 24 * 60;
			return runningTime;
		},
		scanNodes: function() {
			return new Promise(function(resolve, reject) {
				zwave.once('scan complete', function() {
					console.log('scan complete');
					resolve();
				});
				zwave.connect();
			});
		},
		getWorkingNodeIds: function() {
			return Object.keys(nodes);
		},
		getStartTime: function() {
			return time.to24Hour({hour: automationConfig.configuration.startHour, minutes: automationConfig.configuration.startMinutes}, automationConfig.configuration.startAmpm);		},
		getEndTime: function() {
			return time.to24Hour({hour: automationConfig.configuration.endHour, minutes: automationConfig.configuration.endMinutes}, automationConfig.configuration.endAmpm);		},
		init: co.wrap(function*() {
			yield automation.loadAutomationConfig();
			console.log('running time: ' + automation.getRunningTime() + ' minutes');
			yield automation.scanNodes();
			automation.getWorkingNodeIds();
		})
	};
	return automation;
};

/*
	1. Check start/end times against wall-clock
	2. Take a time add minutes to it (e.g start time and we have a duration that a light's on)
 */