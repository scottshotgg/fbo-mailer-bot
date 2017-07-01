/*
	This file is where the scraping, cleaning, and preparation of said data is done.

	scottshotgg
*/

// Used to map the type of solicitation from the acronym to the actual human readable form
var typeMapping = {
	"PRESOL" 	: "Presolicitation",
	"COMBINE"	: "Combined Synopsis/Solicitation",
	"AMDCSS" 	: "Amendment to a Previous Combined Solicitation",
	"MOD"		: "Modification to a Previous Base",
	"AWARD" 	: "Award",
	"JA" 		: "Justification and Approval",
	"ITB" 		: "Intent to Bundle Requirements",
	"FAIROPP" 	: "Fair Opportunity / Limited Sources Justification",
	"SRCSGT" 	: "Sources Sought",
	"FSTD" 		: "Foreign Government Standard",
	"SNOTE" 	: "Special Notice",
	"SSALE" 	: "Sale of Surplus Property",
};

// only explicitly list the stuff that will change, otherwise just slice the end and do a toLowerCase
// Used to map the property type from the acronym to the actual human readable form
var propMapping = {
	'CLASSCOD': 'Classification Code',
	'OFFADD'  : 'Office Address',
	'RESPDATE': 'Response Date',
	'SOLNBR'  : 'Solicitation Number',
	'AWDNBR'  : 'Award Number',
	'AWDAMT'  : 'Award Amount',
	'AWDDATE' : 'Award Date',
	'DESC'    : 'Description',
	'LINENBR' : 'Line Number',
	'NTYPE'   : 'Notice Type',
	'MODNBR'  : 'Modification Number',
	'ARCHDATE': 'Archive Date',
	'SETASIDE': 'Set Aside',
	'NAICS'   : 'NAICS Code',
	'URL'     : 'URL',
	//'POPZIP'  : 'Place of Performance.Zip'
};

// fetchFeed is used to fetch the file for a certain date (defaults to yesterday as this will be run at midnight)
exports.fetchFeed = function(packet) {
	// Create the filename from the date
	var filename = makeFilenameFromDate(packet.date);

	// Try reading the file first to see if we have it
	fs.open(feedDir + filename, 'r', (err, fd) => {
		// If we do not already have the file then we need to retrieve it, else emit and ASYNC parse event
		if (err) {
			if (err.code === 'ENOENT') {
				console.log(filename, 'does not exist, fetching file...');
				// Get the file from FBO
				ftp.get('ftp://ftp.fbo.gov/' + filename, feedDir + filename, function (err, res) { 
					// Only parse if there isn't an error
					if(!err) {
						el.emitAsync('parse', { feed: filename }); 
					} else if(err.code == 550) {
						console.log('There was no feed found for', filename);
						el.emit('finished', 'startup');	
					} else {
						console.log('Error does not have any programmed diagnosis procedure - Exiting!');
						console.log(err);
						process.exit();
					}
				});
			}
		} else {
			console.log(filename, 'has already been downloaded');
			el.emitAsync('parse', { feed: filename });
		}
	});
}

// parseFeed is used to parse incoming feeds for data
exports.parseFeed = function(packet) {
	// Read in the file that we are parsing
	var filedata = fs.readFileSync(feedDir + packet.feed).toString();
	console.log('Parsing', packet.feed);

  	console.log('Inserting records...');

  	/*
  		Use a regular expression to split the data, filter each entry, and then map the remaining to be processed
  		The first filter qualifier is used to get rid of the empty lines and other junk that is in the file
  		The second filter qualifier is used to remove all ARCHIVE and UNARCHIVE entries as we do not want those
	*/
	console.log('async filter...');
	async.filter(filedata.split(/(<\/[A-Z]+>)/g), (item, callback) => {
		callback(item.length > 15 && !item.slice(4, 11).includes('ARCH'));
		// change this back to (results, err) if shit hits the fan for no reason
	}, (err, results) => {
		console.log('async filter done');

		async.map(results, (item, callback) => {
			//console.log(item);
			var datum = postProcessing(splitString(item));
			callback((datum.ID != undefined) && null, datum);

		}, (err, results) => {	
			//el.emit('finished', 'insert');
			console.log('finished');
			async.filter(results, (item, callback) => {
				callback(item.ID != undefined);
			}, (results, err) => { el.emit('insertdata', { data: results }) });

		});
	});
}

// generateNewClientPage is used for generating a new home page for the specified client
exports.generateNewClientPage = function(packet) {

	var client = packet.client; 
	var documents = packet.data;

	console.log(client.personal.netid + ' has ' + documents.length + ' entries');

	//console.log(fs.readFileSync('index.template', 'utf8'));
	// need to check if the client already has a file in the clients folder and if so append to that index, if they dont then make one for them
	var $ = cheerio.load(fs.readFileSync(templatesDir + 'index/index.template.html', 'utf8'));

	// Need to tell the user when something doesn't exist
	// Change this to make it display what the user wants
	var tableColumns = ['Subject', 'ID', 'Opportunity/Procurement Type', 'Agency', 'Date', 'NAICS Code'];

	// we can do some async stuff here I think, but it needs to be ordered; alternatively, we could do it unordered because we have dataTables sort it anyways
	$('thead').html(tableColumns.slice(0, tableColumns.length).map(header => '<th>' + header + '</th>').join('\n'));
	$('tbody').html(documents.map((document) => {

		// Might need to make the link specification more generic
		return '<tr><td>' + makeLink(document[tableColumns[0]], document.URL).concat(tableColumns.slice(1).map((column) => {
				if(column.includes('.')) {
					//console.log(column);
					column = column.split('.');
					// make this recursive
					// make this detect if things are not available and put a '-'
					if(document[column[0]])
						return document[column[0]][column[1]];
					else
						return '-'
				} else {
					if(document[column]) {
					//console.log(column);
					//if(column.toLowerCase().includes('date')) {
						if(typeof document[column] == 'object') {
								return Object.values(document[column]).join('/'); 
							} 
						else {
							return document[column] 
						}
					} else {
						if(typeof document[column] == 'object') { 
							return Object.values(document[column]).join(' -- ') } 
						else { 
							return document[column] 
						}
					}
				}
			})).join('</td><td>') + '</td></tr>';
		}).join('\n'));

	$('#search_parameters').html(Object.keys({}).map((para) => {
		return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
	}));

	console.log('Attempting to write client index file: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
	try {
		fs.writeFileSync(clientsDir + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
		console.log('Client index file successfully written: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
	} catch(err) {
		console.log('Attempting to create client folder: /clients/' + client.personal.netid.toLowerCase());
		mkdirp(clientsDir + client.personal.netid.toLowerCase(), (err) => {
			if (!err) {
				console.log('Client folder successfully created: /clients/' + client.personal.netid.toLowerCase());
				try {

					fs.writeFileSync(clientsDir + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
					console.log('Client index file successfully written: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
				} catch(err) {
					console.log('Error writing client index file: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
				}
			} else {
				console.log('Error creating client folder: /clients', + client.personal.netid.toLowerCase());
			}
		});
	}
}

// Returns a filename (string) from a given date object
function makeFilenameFromDate(date) {
	return 'FBOFeed' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + (date.getDate() - 1)).slice(-2);
}

// Returns an processed object from a given object
function postProcessing(oppo) {
  if(oppo.Date) {
    oppo.Date = oppo.Date.substring(0, 2) + '/' + oppo.Date.substring(2) + '/' + oppo.Year;
  }

  delete oppo.Year;

  if(oppo['Response Date']) {
    oppo['Response Date'] = oppo['Response Date'].substring(0, 2) + '/' + oppo['Response Date'].substring(2) + '/' + oppo.Year;
  }

  if(oppo['Archive Date']) {
   
    oppo['Archive Date'] = oppo['Archive Date'].substring(0, 2) + '/' + oppo['Archive Date'].substring(2) + '/' + oppo.Year;
  }

  if(oppo['Award Date']) {
    oppo['Award Date'] = oppo['Award Date'].substring(0, 2) + '/' + oppo['Award Date'].substring(2) + '/' + oppo.Year;
  }  

  oppo.ID = oppo['Solicitation Number'] || oppo['Award Number'];

  return oppo;
}

// Returns an HTML link string for a given URL 
function makeLink(column, URL) {
	return ['<a href="' + URL + '">' + column + '</a>']
}

// splitString is used in processing the data to construct the initial object from a given string (posting) of data
function splitString(string) {
	console.log('splitString');
	// Split the data by tags. Unfortunately whoever setup the FTP publishing on the FBO site did not bother to include ending tags so we cannot just use Cheerio to parse it
	var stringSplitArray = string.split(/(<[A-Z]+>)/g);

	var object = {};
	// Use the typeMapping object to set the procurement type
	object['Opportunity/Procurement Type'] = typeMapping[stringSplitArray[1].slice(1, -1)];

	// Can probably do an async here as well
	
	// async.map(stringSplitArray, 
	// 	(item, callback) => {
	// 		console.log(item);
	// 		callback(null, item);
	// 	},
	// 	(err, results) => { console.log('splitStringResults', err, results) });

	// Skip every other one starting from 3; the first two or three lines are blank and every other one a value for the current key
	for(var i = 3; i < stringSplitArray.length; i+=2) {
		// Trim the value from the array and strip out the beginning and ending tag symbols; < and >
		var keyRaw = stringSplitArray[i].trim().slice(1,-1);
		// Construct the actual object key from the propMapping or change the entire raw key to a capitalized word
		var key = propMapping[keyRaw] || keyRaw[0] + keyRaw.substring(1).toLowerCase();
		// Now get the value from the next line; this is why we skip every other one
		var value = stringSplitArray[i+1].trim();

		// Test if the text has HTML in it, if so we want to strip it out because we only value the text
		if(/<[a-z][\s\S]*>/i.test(value))
			value = cheerio.load(value).text().trim();

		// If the object does not already contain the key
		if(object[key] == undefined) {
			object[key] = value;
		} else if(value != 'Link To Document') {
			object[key] = [object[key]].concat(value)
		}
	}

	return object;
}
