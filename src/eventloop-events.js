// ===== event loop stuff
var scraper = require('./scraper');
var dbm = require('./database-mongo');
var events = require('./eventloop-events');
var cron = require('./scheduler-cron')
// think of a better naming scheme for this stuff
var host = require('./host-express')

// Using the event-loop for the software architecture
var EventEmitter = require('events');
class EventLoop extends EventEmitter {}

exports.emit = function(event, info) {
	//console.log(arguments)
	//mainEventLoop.emit(Object.values(arguments));
	mainEventLoop.emit(event, info);
}

mainEventLoop = new EventLoop();

// use this if we need it
// var finishMap = {
// 	insert: 
// };



// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	// Use this one to GET the page
	//'page'		: getLinks,			// Get the links of the opportunity off the page
	
	// Use the one to insert 
	//'save'		: databaseSave,		// Save the scraped information in the database
	//'schedule'	: schedule,			// abstract function to schedule a function at a certain time
	//'newOppo'		: newOppo
	//'client': client

	// use this later
	//'finished': 	dbm.processClients
	
	// hardcoded for insert right now, use the mapping thing later
	'finished' 		: dbm.getClients,
	'host' 			: host.startServer,
	'fetch' 		: scraper.fetchFeed,
	'parse' 		: scraper.parseFeed,
	'connectdb' 	: dbm.connectMongoDB,
	'closedb' 		: dbm.closeMongoDB,
	// make this take a data piece and a collection name or map it to the right shit based on an insertion 'type'
	'insertdata' 	: dbm.insertMongoDB,
	'createcoll' 	: dbm.createCollection,
	'upsertdata' 	: dbm.upsertClient,
	'newclientpage' : scraper.generateNewClientPage,
	'respond' 		: host.respond,
	'schedule' 		: cron.schedule
	// 'finishinsert': (packet) => {
	// 	console.log('hi, i am finished inserting yo', packet);
	// },
};

//mainEventLoop.on('connect', dbm.connectMongoDB());

// For some reason this doesnt work when you call externally; use the above for now
// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
	Object.keys(eventLoopFunctions).map((item, index) => {
		mainEventLoop.on(item, (packet) => {
			//console.log(item, packet);
			eventLoopFunctions[item](packet);
		});
	});
})();

// mainEventLoop.emit('respond', 
// 				{ 
// 					run: () => {
// 						res.json({ name: 'scg104020' });
// 					} 
// 				}
// 			);

// just use this for now
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// this works
// use this schedule to begin a whole sequence of scraping and then emailing and generating new pages for clients
//mainEventLoop.emit('schedule', { dateObj: cronDate, func:  });

mainEventLoop.emit('connectdb', { dbname: 'fbo-mailer' });
mainEventLoop.emit('host');
//mainEventLoop.emit('createcoll');

//mainEventLoop.emit('fetch');
