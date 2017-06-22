// MongoDB for the database

var MongoClient = require('mongodb').MongoClient;
var cheerio = require('cheerio');

var fbodataCollection;
var fbodataClients;

//console.log('\n\n\n---------------------------------------\n\n\n');

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


// FIX THIS AND REARCH IT
// ====== db stuff

exports.parseFeed = function(filename) {
  var filedata = fs.readFileSync(__dirname + '/resources/feed/' + filename).toString();
  var thing = filedata;
  console.log('starting');
  createCollection();
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
}


exports.connectMongoDB = function(thing) {
  console.log('connecting to the database');
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/fbo-mailer", function(err, mdb) {
  	if(!err) {
  		console.log('Connected');
      mainEventLoop.emit('fetch');
  		database.mdb = mdb;
  		//console.log(mdb);
  		//createCollection();

  		// put this somewhere else later

		

		//console.log(clients.getParameters())

		fboclientsCollection.find().forEach((client) => {
			console.log(client.personal.netid, client.search);
			//console.log(client, client.search);

			// var ammendedSearchParams = Object.assign(...Object.keys(client.search).map((key) => {
			// 	return { ['Data.' + key] : client.search[key] }
			// }));
			//process.exit(0);

			//console.log(ammendedSearchParams);

			fbodataCollection.find(client.search).toArray((err, documents) => {
				generateNewClientPage(client, documents);
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

exports.createCollection = function() {
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
//  console.log('\n\n\n');

// ============== dont do anything with this ==============

// this needs to take the html out of the description or make a seperate description
// this needs to do some contact parsing on the contact data and stuff
function postProcessing(oppo) {
  //oppo.Date = {};
  //oppo.Month = ;
  //oppo.Day = ;

  //if(oppo.ID == '' || oppo.ID == undefined) 
    //console.log(oppo);
  
  if(oppo.Date) {
    // oppo.Date = { 
    //  Month   : oppo.Data.Date.substring(0, 2), 
    //  Day   : oppo.Data.Date.substring(2), 
    //  Year  : oppo.Data.Year 
    // };
    oppo.Date = oppo.Date.substring(0, 2) + '/' + oppo.Date.substring(2) + '/' + oppo.Year;
  }

  delete oppo.Year;



  // if(oppo['Classification Code']) {
  //  var classification = {};
  //  classification['ID'] = oppo['Classification Code'];
  //  classification['Text'] = codeMapping['Classification Code'][oppo['Classification Code']];
  //  //console.log(classification);

  //  oppo['Classification Code'] = classification;
  // }

  // if(oppo['NAICS Code']) {
  //  var naics = {};
  //  naics['ID'] = oppo['NAICS Code'];
  //  naics['Text'] = codeMapping['NAICS Code'][oppo['NAICS Code']];
  //  //console.log(naics);

  //  oppo['NAICS Code'] = naics;
  // }

  // May consider making a seperate month/day/year for this
  if(oppo['Response Date']) {
    // oppo['Response Date'] = { 
    //  Month   : oppo['Response Date'].substring(0, 2), 
    //  Day   : oppo['Response Date'].substring(2, 4), 
    //  Year  : oppo['Response Date'].substring(4) 
    // };
    oppo['Response Date'] = oppo['Response Date'].substring(0, 2) + '/' + oppo['Response Date'].substring(2) + '/' + oppo.Year;
  }

  if(oppo['Archive Date']) {
    /*oppo['Archive Date'] = { 
      Month   : oppo['Archive Date'].substring(0, 2), 
      Day   : oppo['Archive Date'].substring(2, 4), 
      Year  : oppo['Archive Date'].substring(6) 
    };*/
    oppo['Archive Date'] = oppo['Archive Date'].substring(0, 2) + '/' + oppo['Archive Date'].substring(2) + '/' + oppo.Year;
  }

  /*var pop = Object.keys(oppo).filter((item) => { return item.includes('Pop') }).map((item) => {
      var key = item.replace('Pop', '');
      var popObj = { [key[0].toUpperCase() + key.slice(1)]: oppo[item] };
      delete oppo[item];
      return popObj;
  });*/

  if(oppo['Award Date']) {
    /*oppo['Award Date'] = { 
      Month   : oppo['Award Date'].substring(0, 2), 
      Day   : oppo['Award Date'].substring(2, 4), 
      Year  : oppo['Award Date'].substring(4) 
    };*/
    oppo['Award Date'] = oppo['Award Date'].substring(0, 2) + '/' + oppo['Award Date'].substring(2) + '/' + oppo.Year;
  }

  // if(pop.length > 0) {
  //  oppo['Place of Performance'] = Object.assign(...pop);
  // }
  

  oppo.ID = oppo['Solicitation Number'] || oppo['Award Number'];

  //console.log(oppo);

  return oppo;
}

var typeMapping = {
  "PRESOL"  : "Presolicitation",
  "COMBINE"   : "Combined Synopsis/Solicitation",
  "AMDCSS"  : "Amendment to a Previous Combined Solicitation",
  "MOD"     : "Modification to a Previous Base",
  "AWARD"   : "Award",
  "JA"    : "Justification and Approval",
  "ITB"     : "Intent to Bundle Requirements",
  "FAIROPP"   : "Fair Opportunity / Limited Sources Justification",
  "SRCSGT"  : "Sources Sought",
  "FSTD"    : "Foreign Government Standard",
  "SNOTE"   : "Special Notice",
  "SSALE"   : "Sale of Surplus Property",
  //"ARCHIVE"   : "Document Archival",
  //"UNARCHIVE" : "Document Unarchival"
};

// Only explicitly list the stuff that will change, otherwise just slice the end and do a toLowerCase
var propMapping = {
  'CLASSCOD'  : 'Classification Code',
  'OFFADD'  : 'Office Address', // I think this is right??
  'RESPDATE'  : 'Response Date',
  'SOLNBR'  : 'Solicitation Number',
  'AWDNBR'  : 'Award Number',
  'AWDAMT'  : 'Award Amount',
  'AWDDATE' : 'Award Date',
  'DESC'    : 'Description',
  'LINENBR' : 'Line Number',
  'NTYPE'   : 'Notice Type',
  'MODNBR'  : 'Modification Number',
  'ARCHDATE'  : 'Archive Date',
  'SETASIDE'  : 'Set Aside',
  'NAICS'   : 'NAICS Code',
  'URL'   : 'URL',
  //'POPZIP'  : 'Place of Performance.Zip'
};
var fs = require('fs');


function generateNewClientPage(client, documents) {

  console.log(documents.length);

  //console.log(fs.readFileSync('index.template', 'utf8'));
  // need to check if the client already has a file in the clients folder and if so append to that index, if they dont then make one for them
  var $ = cheerio.load(fs.readFileSync(__dirname + '/resources/templates/index.template.html', 'utf8'));

  // Need to tell the user when something doesn't exist
  // Change this to make it display what the user wants
  var tableColumns = ['Subject', 'ID', 'Opportunity/Procurement Type', 'Agency', 'Date', 'NAICS Code'];

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
      //  return '0101010';
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
            return Object.values(document[column]).join(' -- ');
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
  //  return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
  // }));
  $('#search_parameters').html(Object.keys({}).map((para) => {
    return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
  }));
  //console.log(client.Name + 'index.html')
  console.log('/clients/' + client.personal.netid.toLowerCase() + '/index.html');
  try {
    fs.writeFileSync(__dirname + '/clients/' + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
  } catch(err) {
    mkdirp(__dirname + '/clients/' + client.personal.netid.toLowerCase(), function (err) {
        if (!err) {
          fs.writeFileSync(__dirname + '/clients/' + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
        }
    });
  }

}