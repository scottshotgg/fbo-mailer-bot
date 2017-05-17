var fs = require('fs');
var cheerio = require('cheerio');

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
	'URL'		: 'URL'
};




/* Code (below) used to make this object was written by me (github.com/scottshotgg) and used on this page: https://www.fbo.gov/index?s=opportunity&tab=search&mode=list
*/

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
	"PRESOL":"Presolicitation",
	"COMBINE":"Combined Synopsis/Solicitation",
	"AMDCSS":"Amendment to a Previous Combined Solicitation",
	"MOD":"Modification to a Previous Base",
	"AWARD":"Award",
	"JA":"Justification and Approval",
	"ITB":"Intent to Bundle Requirements",
	"FAIROPP":"Fair Opportunity / Limited Sources Justification",
	"SRCSGT":"Sources Sought",
	"FSTD":"Foreign Government Standard",
	"SNOTE":"Special Notice",
	"SSALE":"Sale of Surplus Property",
	"ARCHIVE":"Document Archival",
	"UNARCHIVE":"Document Unarchival"
};


/*
var thing = `<SRCSGT>
<DATE>0514
<YEAR>17
<AGENCY>Department of the Navy
<OFFICE>Naval Sea Systems Command
<LOCATION>NSWC Panama City Divison
<ZIP>32407
<CLASSCOD>R
<NAICS>561990
<OFFADD>110 Vernon Avenue Panama City FL 32407
<SUBJECT>Annual Naval Technology Exercise (ANTX) demonstration event
<SOLNBR>N61331-17-Q-LG10
<RESPDATE>051917
<CONTACT>Luis Gely, Phone 8502355783, Email luis.gely@navy.mil
<DESC>The Naval Surface Warfare Center Panama City, Florida intends to solicit competitive offers to help support the Annual Naval Technology Exercise (ANTX) demonstration event.<span style="mso-spacerun: yes">&nbsp; </span>ANTX is planned to be held in August 2017 timeframe at NSWC PCD. The conference is expected to run three days, starting on Tuesday the 15<sup>th</sup> and completing on Thursday the 18<sup>th</sup>. The support services are expected to begin from the date of the award through August the 11<sup>th</sup>. Due to the nature and magnitude of the event the Contractor shall plan on set-up to begin the week before the event.<span style="mso-spacerun: yes">&nbsp; </span>For planning purposes Contractors should plan on the following to help understand the magnitude and scope of the conference per attached draft SOW.
<LINK>
<URL>https://www.fbo.gov/notices/954ad17d6082dee3d0b4e68acb717f44
<DESC>Link To Document
<SETASIDE>Total Small Business
<POPCOUNTRY>US
<POPZIP>32407
<POPADDRESS>110 Vernon Ave
Panama City, FL
</SRCSGT>`
*/


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

		thing.split(/(<\/[A-Z]+>)/g).filter((item) => { return item.length > 15 }).map((item) => {
			if(!item.slice(4, 11).includes('ARCH')) { // filter out UNARCHIVE and ARCHIVE
				database.insert(postProcessing(splitString(item)));
				//postProcessing(splitString(item))
			}
		});
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
      //mainEventLoop.emit('newOppo', rows)
      //tableLength++;
    })
    // we need to ammend the objects when there is a duplicate
    .catch((err) => {
      console.log('THERE WAS AN ERROR', err);
      console.log(rows);
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
  fbodataCollection.createIndex({'Solicitation Number': 1}, {unique: true});

  lastID = getLastMongoID();
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
	object.Type = {};
	object.Type.Short = array[1].slice(1, -1);
	object.Type.Long  = typeMapping[array[1].slice(1, -1)];

	for(var i = 3; i < array.length; i+=2)
	{
		var keyRaw = array[i].trim().slice(1,-1);
		var key = propMapping[keyRaw] || keyRaw[0] + keyRaw.substring(1).toLowerCase();
		var value = array[i+1].trim();
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

	oppo.Date = { Month: oppo.Date.substring(0, 2), Day: oppo.Date.substring(2), Year: oppo.Year };

	delete oppo.Year;

	if(oppo['Classification Code']) {
		var classification = {};
		classification['ID'] = oppo['Classification Code'];
		classification['Text'] = codeMapping['Classification Code'][oppo['Classification Code']];
		//console.log(classification);

		oppo['Classification Code'] = classification;
	}

	if(oppo['NAICS Code']) {
		var naics = {};
		naics['ID'] = oppo['NAICS Code'];
		naics['Text'] = codeMapping['NAICS Code'][oppo['NAICS Code']];
		//console.log(naics);

		oppo['NAICS Code'] = naics;
	}
	// May consider making a seperate month/day/year for this
	if(oppo['Response Date']) {
		oppo['Response Date'] = { Month: oppo['Response Date'].substring(0, 2), Day: oppo['Response Date'].substring(2, 4), Year: oppo['Response Date'].substring(4) };
	}

	if(oppo['Archive Date']) {
		oppo['Archive Date'] = { Month: oppo['Archive Date'].substring(0, 2), Day: oppo['Archive Date'].substring(2, 4), Year: oppo['Archive Date'].substring(6) };
	}

	var pop = Object.keys(oppo).filter((item) => { return item.includes('Pop') }).map((item) => {
			var popObj = { [item.replace('Pop', '')]: oppo[item] };
			delete oppo[item];

			return popObj;
	});

	if(oppo['Award Date']) {
		oppo['Award Date'] = { Month: oppo['Award Date'].substring(0, 2), Day: oppo['Award Date'].substring(2, 4), Year: oppo['Award Date'].substring(4) };
	}

	if(pop.length > 0) {
		oppo['Place of Performance'] = Object.assign(...pop);
	}
	


	return oppo;
}