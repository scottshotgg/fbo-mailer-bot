// ===== event loop stuff
var scraper = require('./scraper');
var dbm = require('./database-mongo');
var el = require('./eventloop-events');
var cron = require('./scheduler-cron');
// think of a better naming scheme for this stuff
var host = require('./host-express');

el.loadEventLoopFunction();

setTimeout(() => {
	el.emit('connectdb', { dbname: 'fbo-mailer' });
	el.emit('host');
}, 1500);

