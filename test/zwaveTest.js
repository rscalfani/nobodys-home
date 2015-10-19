var OZW = require('../node-openzwave/lib/openzwave');
var zwave = new OZW('/dev/cu.SLAB_USBtoUART');

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

//zwave.on('value added', function(nodeid, commandclass, value) {
//	nodes[nodeid][commandclass] = value;
//	//console.log('*****', nodes);
//});
//
//zwave.on('value changed', function(nodeid, commandclass, value) {
//	nodes[nodeid][commandclass] = value;
//	//console.log('+++++', nodes);
//});

zwave.on('node ready', function(nodeid, nodeinfo) {
	Object.keys(nodes[nodeid]).forEach(function(key) {
		nodes[nodeid][key] = nodeinfo[key];
	});
});

zwave.on('scan complete', function() {
	console.log(nodes);
	zwave.switchOff(2);
	zwave.switchOn(3);
	zwave.switchOff(4);
	setTimeout(function() {
		zwave.switchOn(2);
	}, 1000);
	setTimeout(function() {
		zwave.switchOff(3);
	}, 1000);
	setTimeout(function() {
		zwave.switchOn(4);
	}, 1000);
});

zwave.connect();

process.on('SIGINT', function() {
	console.log('disconnecting ' + homeId);
	zwave.disconnect();
	process.exit(1);
});