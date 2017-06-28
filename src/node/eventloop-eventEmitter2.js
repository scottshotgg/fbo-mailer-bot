/*
	This file serves as the event-loop for the program. As of right now it is also the main file for the scraper, but that may change in the future
*/

var scraper = require('./scraper');
var dbm = require('./database-mongo');
var cron = require('./scheduler-cron');
var host = require('./host-express');
var console = require('./log-consoleStamp');
var async = require('async');

var EventEmitter = require('eventemitter2').EventEmitter2;
class EventLoop extends EventEmitter {}

var mainEventLoop = new EventLoop();

// emit is an exported function that emits an event to the event loop
exports.emit = function(event, packet) {
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
	    // results is now equals to: {one: 1, two: 2}
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
	//'schedule' 		: cron.schedule
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
	'schedule' 		: cron.schedule
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

// just use this for now
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// Schedule a fetch event to be fired at the specified date
exports.emitAsync('schedule', { name: 'fetchUpdate', date: cronDate, func: () => { exports.emitAsync('fetch') }});
// Start the server
exports.emitAsync('host');
// Connect to the database
exports.emitAsync('connectdb', { name: 'fbo-mailer' });