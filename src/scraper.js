var fs = require('fs');
var cheerio = require('cheerio');
var session = require('express-session')
var bodyParser = require('body-parser');
/*

		***;** NEED TO SET UP THE EVENT LOOP *****
				  MAKE THE PROGRAM GOOD
*/
 

// Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times
var cron = require('node-cron');

// Might not use this as an abstract, can probably just get it from the database
var cronDate = { 
	minute: '00', 
	hour: 	'00', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// We might just be able to put this in the event mapping thing down there
function schedule(date, func) {
	cron.schedule(Object.values(date).join(' '), func);
}

/*&try {
	fs.openSync(__dirname + '/logs/logfile', 'w');
} catch(err) {
	console.log('Creating log folder');
	fs.mkdirSync(__dirname + 'logs');
	fd = fs.openSync(__dirname + '/logs/logfile', 'w');
}*/
var logdir = __dirname + '/logs'
console.log(logdir)
if(!fs.existsSync(logdir)) {
	fs.mkdirSync(logdir);
}



// Using console stamp to provide better print outs for debugging
var cs = require("console-stamp") (console, {
	metadata: function () {
		var funcout = __function;


		var printout = ('[ RAM: ' + (process.memoryUsage().rss  / 1000000).toFixed(2) + ' MB | caller: ' + __function + ' | line: ' + __line + ' ]');
		//console.log(console);
		fs.appendFileSync(logdir + '/logfile', printout + '\n', 'utf8');

		return printout;
	},
	colors: {
		stamp:    "yellow", 
		label:    "red",
		metadata: "green"
	}
});

// Set up the console stamp
// Line number stuff
Object.defineProperty(global, '__stack', {
	get: function(){
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(_, stack) { return stack; };
		var err = new Error;
		Error.captureStackTrace(err, arguments.callee);
		var stack = err.stack;
		Error.prepareStackTrace = orig;
		return stack;
	}
});

// Using this to avoid drawing off the top of the stack when recursing through in the printout; stole it from somewhere, will try to find the source
var globalStackDrawValue = 3;

Object.defineProperty(global, '__line', {
	get: function() {
		return __stack[globalStackDrawValue].getLineNumber();
	}
});

Object.defineProperty(global, '__function', {
	get: function() {
		return __stack[globalStackDrawValue].getFunctionName();
	}
});

// Using request to GET the page from yesterday 
var request = require('request');

// SendMail for emailing the updates
var sendmail = require('sendmail')();

// This needs to be reformated for the current architecture
function sendEmail(email, html, length) {
  sendmail({
    from: 'FBO-Mailer-Bot@utdallas.edu',
    to: email,
    subject: length + ' NEW FBO Opportunities Found - ' + getDateInfo().join('/'),
    text: '',
    html: html
  },  
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
}


// ===== event loop stuff

// Using the event-loop for the software architecture
const EventEmitter = require('events');
class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	// Use this one to GET the page
	//'page'		: getLinks,			// Get the links of the opportunity off the page
	
	// Use the one to insert 
	//'save'		: databaseSave,		// Save the scraped information in the database
	//'schedule'	: schedule,			// abstract function to schedule a function at a certain time
	//'newOppo'		: newOppo
	//'client': client

};

// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();

// Could make something that packs their search terms into a Data object based on the names of the variables they give

// Front end needs to insert objects like this
var clients = [
	{
		ID 			: 0,
		Name 		: 'complete',
		Username 	: '',
		Email 		: '', // This should be arc@lists.utdallas.edu
		Parameters 	: {
			// Empty will grab everything
		}
	},
	{
		ID 			: 1,
		Name 		: 'Scott',
		Username 	: 'scott',
		Email 		: 'scg104020@utdallas.edu',
		Parameters 	: {
			//Type: 'AMDCSS'
			//Type 	: 'COMBINE',
			'Data.Agency': 'Department of the Army'
			//'Data.Classification Code.ID': 'R'
		},
	}, 
	{
		ID 			: 2,
		Name 		: 'Jensen',
		Username 	: 'jensen',
		Email 		: 'jsn666@utdallas.edu',
		Parameters 	: {
			//Type: 'AMDCSS'
			Type 	: 'COMBINE',
			//'Data.Agency': 'Department of the Army',
			'Data.Classification Code.ID': 'A'
		}
	}
];


// Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times
var cron = require('node-cron');

// Might not use this as an abstract, can probably just get it from the database
var cronDate = { 
	minute: '05', 
	hour: 	'00', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// We might just be able to put this in the event mapping thing down there
function schedule(packet) {
	cron.schedule(Object.values(packet.dateObj).join(' '), packet.func);
}

// Express is used to host the website, we do not want to use Apache or w/e
// http://expressjs.com/en/api.html#res.download
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');

// change this to use better pathing I guess, this should also get the current directory
app.use(express.static('/Users/scottgaydos/Development/fbo-spider-phantomjs'));//, { 'fallthrough': false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

var router = express.Router();

app.get('/', function (req, res) {
	console.log('views', req.session.views);
	req.session.views = 1;
	console.log('views', req.session.views);
	res.sendFile(__dirname + '/signup/signup.html');
});

app.get('/signup', function (req, res) {
	res.sendFile(__dirname + '/signup/signup.html');
});

app.post('/validate_personal', function (req, res) {

	console.log('validate_personal', req.body);

	req.session.personal = req.body;

	// For some reason this works ???
	res.json('');
});

app.post('/validate_search', function (req, res) {

	console.log('validate_search', req.body);

	console.log(req.body);

	req.session.search = req.body;
	console.log(req.session);
	// For some reason this works ???
	res.json('');
});

app.post('/validate_display', function (req, res) {

	console.log('validate_display', req.body);

	console.log(req.body);

	req.session.display = req.body;
	console.log(req.session);
	// For some reason this works ???

	// database stuff

	// put this for the clients thing
	// Promise.resolve(fboclientsCollection.find({}, (err, cursor) => {
	// 	cursor.toArray().then((documents) => {
	// 		console.log(documents);
	// 		res.json('');
	// 	})
	// }));

	Promise.resolve(fboclientsCollection.insert(req.session))
		.then(() => {
			res.json({ name: req.session.personal.firstname });
		});
});

app.get('/search_preferences', function (req, res) {

	console.log(req.session);

	//console.log('viewse', req.session.views);
	res.sendFile(__dirname + '/signup/search_preferences.html');
});

app.get('/search_preferences.js', function (req, res) {
	res.sendFile(__dirname + '/signup/search_preferences.js');
});

app.get('/search_preferences.css', function (req, res) {
	res.sendFile(__dirname + '/signup/search_preferences.css');
});

app.get('/display_preferences', function (req, res) {

	console.log(req.session);

	//console.log('viewse', req.session.views);
	res.sendFile(__dirname + '/signup/display_preferences.html');
});

app.get('/display_preferences.js', function (req, res) {
	res.sendFile(__dirname + '/signup/display_preferences.js');
});

app.get('/display_preferences.css', function (req, res) {
	res.sendFile(__dirname + '/signup/display_preferences.css');
});

app.get('/data.json', function (req, res) {
	res.sendFile(__dirname + '/signup/data.json');
});

app.get('/fboform', function (req, res) {

	console.log(req.session.personal);

	//console.log('viewse', req.session.views);
	res.sendFile(__dirname + '/signup/fboform.html');
});

app.post('/submit', function (req, res) {
	// now we put the checkboxes and drop it into the database

});

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});

app.get('/:id', function (req, res) {
	console.log("serving user:", req.url);
	res.sendFile(__dirname + '/clients/' + req.url.toLowerCase() + '/index.html');
});

app.post('/client', function (req, res) {
	console.log('I got something');

	fboclientsCollection.insert({ 
		ID 			: Math.floor((Math.random() * 999) + 1), 
		Name 		: randomstring.generate(), 
		Parameters 	: {
			Type 			: 'COMBINE',
			//'Data.Agency' 	: 'Department of the Army'
			//'Data.ClassificationCode': 'Y'
		}
	});
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('<center><h1>Something broke!<h1><center>')
});

app.listen(8080, function () {
  console.log('Listening on port 8080!')
});

var randomstring = require("randomstring");

var date = new Date();

//console.log(pages);

//console.log('FBOFeed' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + (date.getDate())).slice(-2));

//process.exit(0);

var filename = 'FBOFeed' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + (date.getDate() - 1)).slice(-2);
// client.js
var ftp = require('ftp-get')

var thing;

// Check if the file exists, if it doesnt then go GET the file
fs.open(__dirname + '/resources/feed/' + filename, 'r', (err, fd) => {
	if (err) {
		if (err.code === 'ENOENT') {
			console.error(filename, 'does not exist, fetching file...');
			ftp.get('ftp://ftp.fbo.gov/' + filename, __dirname + '/resources/feed/' + filename, function (err, res) {
				console.log(err, res); 
			});
		}
	}
});

ftp.get('ftp://ftp.fbo.gov/' + filename, __dirname + '/resources/feed/' + filename, function (err, res) {
	console.log(err, res); 
	thing = fs.readFileSync(__dirname + '/resources/feed/' + filename, 'utf8');
	//start();
	connectMongoDB();
});


// Only explicitly list the stuff that will change, otherwise just slice the end and do a toLowerCase
var propMapping = {
	'CLASSCOD'	: 'Classification Code',
	'OFFADD'	: 'Office Address', // I think this is right??
	'RESPDATE'	: 'Response Date',
	'SOLNBR'	: 'Solicitation Number',
	'AWDNBR'	: 'Award Number',
	'AWDAMT'	: 'Award Amount',
	'AWDDATE'	: 'Award Date',
	'DESC'		: 'Description',
	'LINENBR'	: 'Line Number',
	'NTYPE'		: 'Notice Type',
	'MODNBR'	: 'Modification Number',
	'ARCHDATE'	: 'Archive Date',
	'SETASIDE'	: 'Set Aside',
	'NAICS'		: 'NAICS Code',
	'URL'		: 'URL',
	//'POPZIP'	: 'Place of Performance.Zip'
};




/* Code (below) used to make this object was written by me (github.com/scottshotgg) and used on this page: https://www.fbo.gov/index?s=opportunity&tab=search&mode=list
*/
;
/* Code:
	JSON.stringify(Object.assign(...[].slice.call(document.getElementsByClassName('scrollable_checkbox')).slice(1).map((item) => {
		return {[item.parentElement.parentElement.parentElement.children[0].innerText.split('.')[0]]: 	Object.assign(...[].slice.call(item.children).map((checkbox) => {
			var split = checkbox.innerText.split(' -- ');
			return {[split[0]]: split[1]};
		}))};
	})));
*/
// See the file for the reason that this object is not directly in here.
var codeMapping = JSON.parse(fs.readFileSync(__dirname + '/codeMapping', 'utf8'));




/* The code (below) used to make this was written by me (github.com/scottshotgg) and used on https://github.com/chriskottom/fbo:
*/
/* Code:
JSON.stringify(Object.assign(...[].slice.call(document.getElementsByTagName('li')).slice(17, 31).map((item, index) => {
	var split = item.innerText.split(' (');
	return {[split[1].replace(')', '')]: split[0]};
})));
*/

var typeMapping = {
	"PRESOL" 	: "Presolicitation",
	"COMBINE" 	: "Combined Synopsis/Solicitation",
	"AMDCSS" 	: "Amendment to a Previous Combined Solicitation",
	"MOD" 		: "Modification to a Previous Base",
	"AWARD" 	: "Award",
	"JA" 		: "Justification and Approval",
	"ITB" 		: "Intent to Bundle Requirements",
	"FAIROPP" 	: "Fair Opportunity / Limited Sources Justification",
	"SRCSGT" 	: "Sources Sought",
	"FSTD" 		: "Foreign Government Standard",
	"SNOTE" 	: "Special Notice",
	"SSALE" 	: "Sale of Surplus Property",
	//"ARCHIVE" 	: "Document Archival",
	//"UNARCHIVE"	: "Document Unarchival"
};


// MongoDB for the database
var MongoClient = require('mongodb').MongoClient;
var fbodataCollection;
var fbodataClients;

console.log('\n\n\n---------------------------------------\n\n\n');

//connectMongoDB();
// Database object that is used as an abstracted accessor to the Mongo function
var database = {};
database.close = function() { this.mdb.close() };
database.insert = function(data) { insertMongoDB(data) };


//console.log(seperated[0])
//console.log(septhing[0]);

function makeLink(column, URL) {
	return ['<a href="' + URL + '">' + column + '</a>']
}


function sendEmail(client, documents) {

	console.log(documents.length);

	//console.log(fs.readFileSync('index.template', 'utf8'));
	// need to check if the client already has a file in the clients folder and if so append to that index, if they dont then make one for them
	var $ = cheerio.load(fs.readFileSync(__dirname + '/resources/templates/index.template.html', 'utf8'));

	// Need to tell the user when something doesn't exist
	// Change this to make it display what the user wants
	var tableColumns = ['Subject', 'ID', 'Type', 'Agency', 'Date', 'NAICS Code.Text'];

	$('thead').html(tableColumns.slice(0, tableColumns.length).map(header => '<th>' + header + '</th>').join('\n'));
	$('tbody').html(documents.map((document) => {
		//return '<tr><td><center>' + document.Type + '</center></td>' + '<td><center>' + document.ID + '</center></td>' + '<td><center>' + document.Data.Subject + '</center></td>' + '<td><center>' + document.Data.Agency + '</center></td>';

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
			// 	return '0101010';
			 } else {
				if(document[column]) {
					//console.log(column);
					//if(column.toLowerCase().includes('date')) {
					if(typeof document[column] == 'object') {
						//console.log(document.column)
						// Change this to specify the date format and join it like that
						// later though
						return Object.values(document[column]).join('/');
					} else {
						return document[column];
					}
				} else {
					if(typeof document[column] == 'object') {
						//console.log(document.column)
						// Change this to specify the date format and join it like that
						// later though
						return Object.values(document.Data[column]).join(' -- ');
					} else {
						return document[column];
					}
				}
			}
		})).join('</td><td>') + '</td></tr>';


	}).join('\n'));

	//console.log(client.Parameters);

	// // Need to check whether the parameter is an object or not before just returning
	// $('#search_parameters').html(Object.keys(client.Parameters).map((para) => {
	// 	return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
	// }));
	$('#search_parameters').html(Object.keys({}).map((para) => {
		return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
	}));
	//console.log(client.Name + 'index.html')
	console.log('/clients/' + client.personal.username.toLowerCase() + '/index.html');
	fs.writeFileSync(__dirname + '/clients/' + client.personal.username.toLowerCase() + '/index.html', $.html(), 'utf8');
}



// FIX THIS AND REARCH IT
// ====== db stuff

function connectMongoDB() {
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/fbo-mailer", function(err, mdb) {
	if(!err) {
		console.log('Connected');
		database.mdb = mdb;
		//console.log(mdb);
		createCollection();

		// put this somewhere else later

		thing.split(/(<\/[A-Z]+>)/g).filter((item) => { return item.length > 15 }).map((item) => {
			if(!item.slice(4, 11).includes('ARCH')) { // filter out UNARCHIVE and ARCHIVE
				// Uncomment this when we are ready to insert again
				// >>>>>>>> enforce not null here <<<<<<<
				var datum = postProcessing(splitString(item));
				if(datum.ID) {
					database.insert(datum);
				}
				//postProcessing(splitString(item))
				//console.log(postProcessing(splitString(item)));
			}
		});

		//console.log(clients.getParameters())

		fboclientsCollection.find().forEach((client) => {
			console.log(client.personal.username);
			console.log(client, client.search);

			var ammendedSearchParams = Object.assign(...Object.keys(client.search).map((key) => {
				return { ['Data.' + key] : client.search[key] }
			}))
			//process.exit(0);

			console.log(ammendedSearchParams);

			fbodataCollection.find(client.search).toArray((err, documents) => {
				sendEmail(client, documents);
			});
		});



		// clients.map((client) => {
		// 	fbodataCollection.find(client.Parameters, function(err, cursor) {
		// 		cursor.toArray().then((documents) => {
		// 			sendEmail(client, documents);
		// 		});
		// 	});
		// });
		//console.log('hi');
		//database.close();

    } else {
      console.log(err);
      process.exit(1);
    }
  });
}

// Function to save data in the database
// Need to fix the ID thing
function databaseSave(data) {
	console.log('data', data);
	database.insert(data);
	//database.close()
}

// NEED TO ADD ID STUFF
function insertMongoDB(rows) {
  //console.log('inserting...', rows);
  /*fbodataCollection.insert(row, () => {
      console.log('ima muhhhfkin callback son');
    })*/
  fbodataCollection.insert(rows)
    .then(() => {
    	//console.log('success');
    })
    .catch((err) => {

    });
}

function createCollection() {
  console.log('We are connected');

  database.mdb.collection('counters').insert(
    { _id: "userid",
      seq: 0 }, 
      function(err, records) {
    }
  );

  fbodataCollection = database.mdb.collection('fbodata');
  fbodataCollection.createIndex({ ID: 1, Type: 1, Date: 1 }, {unique: true});
  
  // Try to mock enforce it with this
  //fbodataCollection.insert({ID: undefined, Type});

  fboclientsCollection = database.mdb.collection('fboclients');
  fboclientsCollection.createIndex({ _id: 1 }, {unique: true});

  //lastID = getLastMongoID();
}

function getLastMongoID() {
  return fbodataCollection.find({}).sort({'ID': -1}).limit(1).next()
    .then(value => {
      return value.ID;
    })
    .catch(() => {
      return 0;
    });
}


function getNextSequence(name, row) {
  database.mdb.collection('counters').findAndModify(
    { _id: name },
    undefined,
    { $inc: { seq: 1 } },
    function(err, object) {
      if(!err) {
        row.ID = object.value.seq;
        //console.log(row);
        fbodataCollection.insert(row);
      }
    });
}





//console.log(thing.match(/(<[A-Z]+>[A-Z]*[a-z]*[0-9]*[' ']*)+/g));
// thing.split(/(<[A-Z]+>.*)/g).map((item, index) => {
// 	if(item != '\n' && item != '')
// 		console.log(index, item);
// });

//console.log(thing.split(/(<[A-Z]+>.*)/g));
// var array = [];
// thing.split(/(<[A-Z]+>)/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);

// for(var i = 1; i < array.length; i+=2)
// 	console.log(array[i], array[i+1])

// var array = [];
// thing.split(/(<[A-Z]>)+/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);


// ============== dont do anything with this ==============


function splitString(thing) {
	var array = thing.split(/(<[A-Z]+>)/g);

	var object = {};
	//object.Data = {};
	//object.Data['Opportunity/Procurement Type'] = typeMapping[array[1].slice(1, -1)];
	object['Opportunity/Procurement Type'] = typeMapping[array[1].slice(1, -1)];

	for(var i = 3; i < array.length; i+=2)
	{
		var keyRaw = array[i].trim().slice(1,-1);
		var key = propMapping[keyRaw] || keyRaw[0] + keyRaw.substring(1).toLowerCase();
		var value = array[i+1].trim();

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
	//console.log(object);
	return object;
}
//	console.log('\n\n\n');

// ============== dont do anything with this ==============

// this needs to take the html out of the description or make a seperate description
// this needs to do some contact parsing on the contact data and stuff
function postProcessing(oppo) {
	//oppo.Date = {};
	//oppo.Month = ;
	//oppo.Day = ;

	//if(oppo.ID == '' || oppo.ID == undefined) 
		//console.log(oppo);
	/*
	if(oppo.Data.Date) {
		oppo.Date = { 
			Month 	: oppo.Data.Date.substring(0, 2), 
			Day 	: oppo.Data.Date.substring(2), 
			Year 	: oppo.Data.Year 
		};
	}


	delete oppo.Data.Year;
	delete oppo.Data.Date;



	if(oppo.Data['Classification Code']) {
		var classification = {};
		classification['ID'] = oppo.Data['Classification Code'];
		classification['Text'] = codeMapping['Classification Code'][oppo.Data['Classification Code']];
		//console.log(classification);

		oppo.Data['Classification Code'] = classification;
	}

	if(oppo.Data['NAICS Code']) {
		var naics = {};
		naics['ID'] = oppo.Data['NAICS Code'];
		naics['Text'] = codeMapping['NAICS Code'][oppo.Data['NAICS Code']];
		//console.log(naics);

		oppo.Data['NAICS Code'] = naics;
	}

	// May consider making a seperate month/day/year for this
	if(oppo.Data['Response Date']) {
		oppo.Data['Response Date'] = { 
			Month 	: oppo.Data['Response Date'].substring(0, 2), 
			Day 	: oppo.Data['Response Date'].substring(2, 4), 
			Year 	: oppo.Data['Response Date'].substring(4) 
		};
	}

	if(oppo.Data['Archive Date']) {
		oppo.Data['Archive Date'] = { 
			Month 	: oppo.Data['Archive Date'].substring(0, 2), 
			Day 	: oppo.Data['Archive Date'].substring(2, 4), 
			Year 	: oppo.Data['Archive Date'].substring(6) 
		};
	}

	var pop = Object.keys(oppo.Data).filter((item) => { return item.includes('Pop') }).map((item) => {
			var key = item.replace('Pop', '');
			var popObj = { [key[0].toUpperCase() + key.slice(1)]: oppo.Data[item] };
			delete oppo.Data[item];
			return popObj;
	});

	if(oppo.Data['Award Date']) {
		oppo.Data['Award Date'] = { 
			Month 	: oppo.Data['Award Date'].substring(0, 2), 
			Day 	: oppo.Data['Award Date'].substring(2, 4), 
			Year 	: oppo.Data['Award Date'].substring(4) 
		};
	}

	if(pop.length > 0) {
		oppo.Data['Place of Performance'] = Object.assign(...pop);
	}
	*/

	oppo.ID = oppo['Solicitation Number'] || oppo['Award Number'];

	return oppo;
}