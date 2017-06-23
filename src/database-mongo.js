// MongoDB for the database

var MongoClient = require('mongodb').MongoClient;
var cheerio = require('cheerio');
var el = require('./eventloop-events')

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


exports.connectMongoDB = function(packet) {
  console.log('Initiating connection to', packet.dbname);
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/" + packet.dbname, function(err, mdb) {
  	if(!err) {
  		console.log('Connected to', packet.dbname);
  		database.mdb = mdb;
      	//el.emit('finished', {'event': 'connect'});
      	el.emit('createcoll', { '': '' })
  		
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
exports.insertMongoDB = function(packet) {
  //console.log('inserting...');
  /*fbodataCollection.insert(row, () => {
      console.log('ima muhhhfkin callback son');
    })*/
  fbodataCollection.insert(packet.data)
    .then(() => {
    	//console.log('success');
    })
    .catch((err) => {
    	// log this stuff to a completely seperate error file
    	//console.log(err);
    });
}


exports.createCollection = function(collName) {
  console.log('Creating collection', collName);

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
  //fboclientsCollection.createIndex({ _id: 1 }, {unique: true});

  //lastID = getLastMongoID();

  // this should emit a finish and let the event loop determine if it is time to fetch
  el.emit('fetch');
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

// this can be done in parallel with inserting all the shit
exports.getClients = function() {

	console.log("Getting clients...");

	/*
	fboclientsCollection.find().map((client) => {
		console.log(client);
		console.log(client.personal.netid, client.search);

		// attach a timestamp for when it was generated and check that before we generate new ones
		// we should do this when a new page is scraped

		// fbodataCollection.find(client.search).toArray((err, documents) => {
		// 	generateNewClientPage(client, documents);
		// });
	});
	*/
	fboclientsCollection.find().toArray((err, clients) => {
		clients.map((client) => {
			fbodataCollection.find(client.search).toArray((err, documents) => {
				//generateNewClientPage(client, documents);
				el.emit('newclientpage', { client: client, data: documents });
			});
		});
	});
}



// clients.map((client) => {
// 	fbodataCollection.find(client.Parameters, function(err, cursor) {
// 		cursor.toArray().then((documents) => {
// 			sendEmail(client, documents);
// 		});
// 	});
// });
//console.log('hi');
//database.close();


exports.upsertClient = function(packet) {
	console.log(packet)

	Promise.resolve(fboclientsCollection.update({ 'personal.netid': packet.client.personal.netid }, packet.client, { upsert: true }))
	.then(() => {
		fbodataCollection.find(packet.client.search).toArray((err, documents) => {
			// this is where we may need the event loop
			el.emit('newclientpage', { client: packet.client, data: documents });

			// this should probably only fire on success, or we can make them a page that redirects and tells them that something is wrong
			el.emit('respond', 
				{ 
					res: packet.res,
					responseFunction: () => {
						res.json({ name: packet.client.personal.netid });
					}
				}
			);

			console.log('Inserted client', packet.client.personal.netid)
		});

	});
}