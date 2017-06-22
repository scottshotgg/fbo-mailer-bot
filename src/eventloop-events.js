// ===== event loop stuff
var scraper = require('./scraper');
var dbm = require('./database-mongo');
var events = require('./eventloop-events');

// Using the event-loop for the software architecture
var EventEmitter = require('events');
class EventLoop extends EventEmitter {}

exports.emit = function(event, info) {
	console.log(arguments)
	//mainEventLoop.emit(Object.values(arguments));
	mainEventLoop.emit(event, info);
}

mainEventLoop = new EventLoop();

// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	// Use this one to GET the page
	//'page'		: getLinks,			// Get the links of the opportunity off the page
	
	// Use the one to insert 
	//'save'		: databaseSave,		// Save the scraped information in the database
	//'schedule'	: schedule,			// abstract function to schedule a function at a certain time
	//'newOppo'		: newOppo
	//'client': client

	'fetch': 	scraper.fetchFeed,
	'parse': 	dbm.parseFeed,
	'connect': 	dbm.connectMongoDB
};

// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();

mainEventLoop.emit('connect');
