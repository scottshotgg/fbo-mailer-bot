// ===== event loop stuff

var scraper = require('./scraper');

// Using the event-loop for the software architecture
var EventEmitter = require('events');
class EventLoop extends EventEmitter {}
var mainEventLoop = new EventLoop();

// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	// Use this one to GET the page
	//'page'		: getLinks,			// Get the links of the opportunity off the page
	
	// Use the one to insert 
	//'save'		: databaseSave,		// Save the scraped information in the database
	//'schedule'	: schedule,			// abstract function to schedule a function at a certain time
	//'newOppo'		: newOppo
	//'client': client

	'fetch': 	scraper.fetchFeed	

};

// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();

mainEventLoop.emit('fetch');