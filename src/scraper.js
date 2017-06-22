var fs = require('fs');
var ftp = require('ftp-get');
var eventloop = require('./eventloop-events');

function makeFilenameFromDate(date) {
	return 'FBOFeed' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + (date.getDate() - 1)).slice(-2);
}

exports.fetchFeed = function(date = new Date()) { 
	// change the pathdir stuff
	// put the new Date somewhere else so it is implicit
	//var filename = makeFilenameFromDate(new Date(date));
	var filename = makeFilenameFromDate(date);

	fs.open(__dirname + '/resources/feed/' + filename, 'r', (err, fd) => {
		if (err) {
			if (err.code === 'ENOENT') {
				console.error(filename, 'does not exist, fetching file...');
				ftp.get('ftp://ftp.fbo.gov/' + filename, __dirname + '/resources/feed/' + filename, function (err, res)
				{
					console.log(err, res); 
					eventloop.emit('parse', filename);
					//databasemongo.connectMongoDB(fs.readFileSync(__dirname + '/resources/feed/' + filename, 'utf8'));
				});
			} 
		} else {
			console.log(filename, 'already downloaded');
			eventloop.emit('parse', filename);
		}
	});
}