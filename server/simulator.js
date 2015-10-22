var co = require('co');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var R = require('ramda');
var time = require('./time');

module.exports = function(config, automation) {
	var simulatorConfig;
	var numberOfSessions = 0;
	var sessionLength = 0;
	var workingSet;
	var startTime;
	var nodeTimes = [];

	var simulator = {
		loadSimulatorConfig: co.wrap(function*() {
			simulatorConfig = JSON.parse(yield pfs.readFileAsync(config.ws.simulatorLoc));
		}),
		getNumberOfSessions: function() {
			simulatorConfig.configuration.controllers.forEach(function(controller) {
				if (controller.cycles != '')
					numberOfSessions += Number(controller.cycles);
			});
			return numberOfSessions;
		},
		getSessionLength: function() {
			sessionLength = automation.getRunningTime()/simulator.getNumberOfSessions(); //make sure to only call getNumberOfSessions ONCE!
			return sessionLength;
		},
		getWorkingSet: function() {
			var workingNodeIds = automation.getWorkingNodeIds();
			workingSet = R.filter(function(controller) {
				//keep configured nodes that are working
				return R.indexOf(controller.nodeId, workingNodeIds) != -1;
			}, simulatorConfig.configuration.controllers);
			var compare = function(a, b) {return Number(b.minutes) - Number(a.minutes)};
			workingSet = R.sort(compare, workingSet);
		},
		getSessionTimes: function() {
			startTime = automation.getStartTime();
			var endTime = automation.getEndTime();
			console.log(startTime, endTime);
		},
		getNodeTimes: function() {
			var start = startTime;
			workingSet.forEach(function(node) {
				for (var i = 0; i < node.cycles; i++) {
					nodeTimes.push({nodeId: node.nodeId, start: start, end: time.addMinutes(start, Number(node.minutes))});
					start = time.addMinutes(start, sessionLength);
				}
			});
		},
		init: co.wrap(function*() {
			yield simulator.loadSimulatorConfig();
			console.dir(simulatorConfig, {depth: null});
			simulator.getSessionLength();
			simulator.getWorkingSet();
			simulator.getSessionTimes();
			simulator.getNodeTimes();
			console.log('number of sessions: ' + numberOfSessions);
			console.log('session length: ' + sessionLength + ' minutes');
			console.dir(workingSet, {depth: null});
			console.dir(nodeTimes, {depth: null});
		})
	};
	return simulator;
};