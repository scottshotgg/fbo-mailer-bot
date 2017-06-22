var scraper = require('./scraper');
var dbm = require('./database-mongo');
var el = require('./eventloop-events');


//mainEventLoop.emit('fetch');
el.emit('fetch', {'nothing': 'nothing'});