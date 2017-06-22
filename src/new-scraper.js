var scraper = require('./scraper');
var dbm = require('./database-mongo');
var events = require('./eventloop-events');


mainEventLoop.emit('fetch');