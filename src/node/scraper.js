variables = require('./globals');

console.log(scraper)


// just use this for now
var cronDate = { 
	minute: '15', 
	hour: 	'16', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// Schedule a fetch event to be fired at the specified date
el.emitAsync('schedule', { name: 'fetchUpdate', date: cronDate, func: () => { variables.el.emitAsync('fetch') }
});
// Start the server
el.emitAsync('host');
// Connect to the database
el.emitAsync('connectdb', { name: 'fbo-mailer' });