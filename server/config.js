var config = {
	ws: {
		passwordLoc: '/tmp/nhpass', //TODO find proper location
		codeLoc: '/tmp/nhcode', //TODO find proper location
		simulatorLoc: '/tmp/simulator', //TODO find proper location
		automationLoc: '/tmp/automation', //TODO find proper location
		sessionTimeout: 86400000,
		port: 8080
	}
};

module.exports = config;