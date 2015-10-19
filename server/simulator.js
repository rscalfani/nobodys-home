var co = require('co');
var Promise = require('bluebird');
var pfs = Promise.promisifyAll(require('fs'));
var R = require('ramda');

module.exports = function(config, automation) {
	var simulatorConfig;
	var numberOfSessions = 0;
	var sessionLength = 0;

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
			var workingSet = R.filter(function(controller) {
				//keep configured nodes that are working
				return R.indexOf(controller.nodeId, workingNodeIds) != -1;
			}, simulatorConfig.configuration.controllers);
			var compare = function(a, b) {return Number(b.minutes) - Number(a.minutes)};
			return R.sort(compare, workingSet);
		},
		init: co.wrap(function*() {
			yield simulator.loadSimulatorConfig();
			console.dir(simulatorConfig, {depth: null});
			simulator.getSessionLength();
			console.log('number of sessions: ' + numberOfSessions);
			console.log('session length: ' + sessionLength + ' minutes');
			console.dir(simulator.getWorkingSet(), {depth:null});
		})
	};
	return simulator;
};