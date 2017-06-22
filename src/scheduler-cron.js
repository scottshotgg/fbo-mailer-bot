// cron

// Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times
var cron = require('node-cron');

// Might not use this as an abstract, can probably just get it from the database
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// We might just be able to put this in the event mapping thing down there
exports.schedule = function(packet) {
	// make default values
	cron.schedule(Object.values(packet.dateObj).join(' '), packet.func);
}


// // Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times

// // Might not use this as an abstract, can probably just get it from the database
// var cronDate = { 
// 	minute: '00', 
// 	hour: 	'00', 
// 	date: 	'*', 
// 	month: 	'*', 
// 	day: 	'*' 
// };

// // We might just be able to put this in the event mapping thing down there
// function schedule(date, func) {
// 	cron.schedule(Object.values(date).join(' '), func);
// }