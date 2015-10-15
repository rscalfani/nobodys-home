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

zwave.on('value added', function(nodeid, commandclass, value) {
	nodes[nodeid][commandclass] = value;
	//console.log('*****', nodes);
});

zwave.on('value changed', function(nodeid, commandclass, value) {
	nodes[nodeid][commandclass] = value;
	//console.log('+++++', nodes);
});

zwave.on('node ready', function(nodeid, nodeinfo) {
	Object.keys(nodes[nodeid]).forEach(function(key) {
		nodes[nodeid][key] = nodeinfo[key];
	});
});

zwave.on('scan complete', function() {
	console.log(nodes);
	//zwave.switchOff(2);
	//zwave.switchOn(3);
	//setTimeout(function() {
	//	zwave.switchOn(2);
	//}, 1000);
	//setTimeout(function() {
	//	zwave.switchOff(3);
	//}, 1000);
});

zwave.connect();

process.on('SIGINT', function() {
	console.log('disconnecting ' + homeId);
	zwave.disconnect();
	process.exit(1);
});





//var OpenZWave = require('../node-openzwave/lib/openzwave');
//
//var zwave = new OpenZWave('/dev/cu.SLAB_USBtoUART', {
//	logging: true,
//	consoleOutput: true,
//	saveconfig: true
//});
//var nodes = [];
//
//zwave.on('driver ready', function(homeid) {
//	console.log('scanning homeid=0x%s...', homeid.toString(16));
//});
//
//zwave.on('driver failed', function() {
//	console.log('failed to start driver');
//	zwave.disconnect();
//	process.exit();
//});
//
//zwave.on('node added', function(nodeid) {
//	nodes[nodeid] = {
//		manufacturer: '',
//		manufacturerid: '',
//		product: '',
//		producttype: '',
//		productid: '',
//		type: '',
//		name: '',
//		loc: '',
//		classes: {},
//		ready: false
//	};
//	console.log('*****' + nodeid);
//});
//
//zwave.on('value added', function(nodeid, comclass, value) {
//	if (!nodes[nodeid]['classes'][comclass])
//		nodes[nodeid]['classes'][comclass] = {};
//	nodes[nodeid]['classes'][comclass][value.index] = value;
//});
//
//zwave.on('value changed', function(nodeid, comclass, value) {
//	if (nodes[nodeid]['ready']) {
//		console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
//			value['label'],
//			nodes[nodeid]['classes'][comclass][value.index]['value'],
//			value['value']);
//	}
//	nodes[nodeid]['classes'][comclass][value.index] = value;
//});
//
//zwave.on('value removed', function(nodeid, comclass, index) {
//	if (nodes[nodeid]['classes'][comclass] &&
//		nodes[nodeid]['classes'][comclass][index])
//		delete nodes[nodeid]['classes'][comclass][index];
//});
//
//zwave.on('node ready', function(nodeid, nodeinfo) {
//	nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
//	nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
//	nodes[nodeid]['product'] = nodeinfo.product;
//	nodes[nodeid]['producttype'] = nodeinfo.producttype;
//	nodes[nodeid]['productid'] = nodeinfo.productid;
//	nodes[nodeid]['type'] = nodeinfo.type;
//	nodes[nodeid]['name'] = nodeinfo.name;
//	nodes[nodeid]['loc'] = nodeinfo.loc;
//	nodes[nodeid]['ready'] = true;
//	console.log('node%d: %s, %s', nodeid,
//		nodeinfo.manufacturer ? nodeinfo.manufacturer
//			: 'id=' + nodeinfo.manufacturerid,
//		nodeinfo.product ? nodeinfo.product
//			: 'product=' + nodeinfo.productid +
//		', type=' + nodeinfo.producttype);
//	console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
//		nodeinfo.name,
//		nodeinfo.type,
//		nodeinfo.loc);
//	for (comclass in nodes[nodeid]['classes']) {
//		switch (comclass) {
//			case 0x25: // COMMAND_CLASS_SWITCH_BINARY
//			case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
//				zwave.enablePoll(nodeid, comclass);
//				break;
//		}
//		var values = nodes[nodeid]['classes'][comclass];
//		console.log('node%d: class %d', nodeid, comclass);
//		for (idx in values)
//			console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
//	}
//});
//
//zwave.on('notification', function(nodeid, notif) {
//	switch (notif) {
//		case 0:
//			console.log('node%d: message complete', nodeid);
//			break;
//		case 1:
//			console.log('node%d: timeout', nodeid);
//			break;
//		case 2:
//			console.log('node%d: nop', nodeid);
//			break;
//		case 3:
//			console.log('node%d: node awake', nodeid);
//			break;
//		case 4:
//			console.log('node%d: node sleep', nodeid);
//			break;
//		case 5:
//			console.log('node%d: node dead', nodeid);
//			break;
//		case 6:
//			console.log('node%d: node alive', nodeid);
//			break;
//	}
//});
//
//zwave.on('scan complete', function() {
//	zwave.switchOff(2);
//	setTimeout(function() {
//		zwave.switchOn(2);
//	}, 1000);
//	setTimeout(function() {
//		zwave.switchOff(2);
//	}, 2000);
//	setTimeout(function() {
//		zwave.switchOn(2);
//	}, 3000);
//	console.log('scan complete, hit ^C to finish.');
//});
//
//zwave.connect();
//
//process.on('SIGINT', function() {
//	console.log('disconnecting...');
//	zwave.disconnect();
//	process.exit();
//});