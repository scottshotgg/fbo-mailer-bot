// ===== event loop stuff
var scraper = require('./scraper');
var dbm = require('./database-mongo');
//var events = require('./eventloop-events');
var cron = require('./scheduler-cron')
// think of a better naming scheme for this stuff
var host = require('./host-express')

// Using the event-loop for the software architecture
//var EventEmitter = require('events');

var EventEmitter = require('eventemitter2').EventEmitter2;
class EventLoop extends EventEmitter {}

mainEventLoop = new EventLoop();

exports.emit = emit;
exports.emitAsync = emitAsync; 

function emit(event, packet) {
	mainEventLoop.emit(event, packet);
}

function emitAsync(event, packet) {
	setTimeout(() => { 
		mainEventLoop.emit(event, packet); 
	}, 0);
}

function finished(event) {
	finishedMap[event]();
}


var finishedMap = {
	//'host' 			: host.startServer,
	'fetch' 		: scraper.parseFeed,
	'parse' 		: scraper.parseFeed,
	'connectdb' 	: dbm.createCollection,
	'insert' 		: dbm.generateClientPages,
	//'closedb' 		: dbm.closeMongoDB,
	// make this take a data piece and a collection name or map it to the right shit based on an insertion 'type'
	//'insertdata' 	: dbm.insertMongoDB,
	//'createcoll' 	: ,
	'upsertclient' 	: scraper.generateNewClientPage,
	'newclientpage' : host.respond,
	//'respond' 		: host.respond,
	//'schedule' 		: cron.schedule
};


// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
var eventLoopFunctions = {
	'finished' 		: finished,
	'host' 			: host.startServer,
	'fetch' 		: scraper.fetchFeed,
	'parse' 		: scraper.parseFeed,
	'connectdb' 	: dbm.connectMongoDB,
	'closedb' 		: dbm.closeMongoDB,
	// make this take a data piece and a collection name or map it to the right shit based on an insertion 'type'
	'insertdata' 	: dbm.insertMongoDB,
	'createcoll' 	: dbm.createCollection,
	'upsertclient' 	: dbm.upsertClient,
	'newclientpage' : scraper.generateNewClientPage,
	'respond' 		: host.respond,
	'schedule' 		: cron.schedule
};

//mainEventLoop.on('connect', dbm.connectMongoDB());

// For some reason this doesnt work when you call externally; use the above for now
// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
	Object.keys(eventLoopFunctions).map((func) => {
		mainEventLoop.on(func, (packet) => {
			//console.log(item, packet);
			eventLoopFunctions[func](packet);
		});
		//finishedMap[func] = 
	});
})();

// just use this for now
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};


emitAsync('connectdb', { dbname: 'fbo-mailer' });
emitAsync('host');