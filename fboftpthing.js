var fs = require('fs');
var cheerio = require('cheerio');


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

var paramMap = {

};

// Could make something that packs their search terms into a Data object based on the names of the variables they give
var clients = {
	ID 			: 1,
	Name 		: 'Scott',
	Username 	: 'scott',
	Email 		: 'scg104020@udallas.edu',
	Parameters 	: {
		//Type: 'AMDCSS'
		Type 	: 'COMBINE',
		Data 	: {
			Agency: 'Department of the Army'
		}
	},
}


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

// change this to use better pathing I guess, this should also get the current directory
app.use(express.static('/Users/scottgaydos/Development/fbo-spider-phantomjs'));//, { 'fallthrough': false }));

var router = express.Router();

// need to make an error page for users that are not in the system, do not expose the file pathing
// this should also retreive the file from 'clients/'
app.get('/:id', function (req, res) {
	console.log("serving user:", req.url.split('/')[1]);
	res.sendFile(__dirname + req.url + 'index.html');
  	//start();
  //res.end();
});

// Change this back to index.html
app.get('/', function (req, res) {
  res.send('<div id="helloworld">Hello World!</div>')
  //res.sendFile('/Users/scottgaydos/Development/fbo-spider-phantomjs/index.template');
  //res.sendfile(__dirname + '/jensenindex.html');
});

//app.listen(8080, function () {
  //console.log('Listening on port 8080!')
//});


var thing = fs.readFileSync('FBOFeed20170514', 'utf8');

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
var codeMapping = JSON.parse(fs.readFileSync('codeMapping', 'utf8'));




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

console.log('\n\n\n---------------------------------------\n\n\n');

connectMongoDB();
// Database object that is used as an abstracted accessor to the Mongo function
var database = {};
database.close = function() { this.mdb.close() };
database.insert = function(data) { insertMongoDB(data) };


//console.log(seperated[0])
//console.log(septhing[0]);




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
		/*thing.split(/(<\/[A-Z]+>)/g).filter((item) => { return item.length > 15 }).map((item) => {
			if(!item.slice(4, 11).includes('ARCH')) { // filter out UNARCHIVE and ARCHIVE
				// Uncomment this when we are ready to insert again
				database.insert(postProcessing(splitString(item)));
				//postProcessing(splitString(item))
				//console.log(postProcessing(splitString(item)));
			}
		});*/

		//console.log(clients.getParameters())
		fbodataCollection.find(clients.Parameters, function(err, cursor) {
			
			// while(cursor.hasNext()) {
			// 	cursor.next().then((item) => { console.log(item) });
			// }

			var documentArray = cursor.toArray().then((item) => {
				console.log(item.length)
			});


		});

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
    	console.log('success');
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
	object.Type = array[1].slice(1, -1);
	object.Data = {};

	object.Data.Type = {};
	object.Data.Type.Short = object.Type;
	object.Data.Type.Long  = typeMapping[array[1].slice(1, -1)];

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
			object.Data[key] = value;
		} else if(value != 'Link To Document') {
			object.Data[key] = [object.Data[key]].concat(value)
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

	oppo.Date = { 
		Month 	: oppo.Data.Date.substring(0, 2), 
		Day 	: oppo.Data.Date.substring(2), 
		Year 	: oppo.Data.Year 
	};


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
		naics['ID'] = oppo['NAICS Code'];
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

	oppo.ID = oppo.Data['Solicitation Number'] || oppo.Data['Award Number'];

	return oppo;
}