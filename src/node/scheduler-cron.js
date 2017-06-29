/*
	This file is used to provide a way to schedule functions at certain times
*/

// Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times

// Might not use this as an abstract, can probably just get it from the database if the clients get the ability to specifiy
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// schedule is used to schedule a certain function at a certain time based off the data from the package
exports.schedule = function(packet) {
	console.log('Scheduling \'' + packet.name + '\' to run at', packet.date);

	// make default values
	cron.schedule(Object.values(packet.date).join(' '), packet.func);
}