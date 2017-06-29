/*
	This file serves as the event-loop for the program. As of right now it is also the main file for the scraper, but that may change in the future
*/
class EventLoop extends EventEmitter {}

var mainEventLoop = new EventLoop();

// emit is an exported function that emits an event to the event loop
exports.emit = function(event, packet) {
	//console.log(packet);
	mainEventLoop.emit(event, packet);
}

// emitAsync is a function that emits an event to the event loop asynchronously
exports.emitAsync = function(event, packet) {
	// setTimeout(() => { 
	// 	mainEventLoop.emit(event, packet); 
	// }, 0);
	async.parallel({
	    one: function() {
	        setTimeout(function() {
	            mainEventLoop.emit(event, packet);
	        }, 0);
	    }
	}, function(err, results) {
		console.log('done', err, results);
	});
}

function finished(event) {
	finishedMap[event]();
}

var finishedMap = {
	//'host' 		: host.startServer,
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
	//'schedule' 		: scheduler.schedule
};


// Provide a mapping for the event loop's event-function associations; look at the function to know what to send it
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
	'schedule' 		: scheduler.schedule
};

// For some reason this doesnt work when you load this file externally
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