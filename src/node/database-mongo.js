/*
	This file serves as the scrapers connection to the database and handles most database operations.
	It uses Mongo DB as the database which means everything is document based.

	scottshotgg
*/

var el = require('./eventloop-eventEmitter2');
// /var async = require('async');

var fbodataCollection;
var fbodataClients;

// Database object that is used as an abstracted accessor to the Mongo function
var database = {};
database.close = function() { this.mdb.close() };
database.insert = function(data) { insertMongoDB(data) };

// connectMongoDB is used to connect the program to the Mongo database specified in the packet
exports.connectMongoDB = function(packet) {
  console.log('Initiating connection to', packet.name);
  // Initiate a connection to the db    
  MongoClient.connect("mongodb://localhost:27017/" + packet.name, function(err, mdb) {
  	// If there wasn't an error then proceed, else just exit and print the error
  	if(!err) {
  		console.log('Connected to', packet.name);
  		database.mdb = mdb;
  		// After creating the database we are ready to create our collections
      	el.emit('createcoll', { '': '' })
  		
    } else {
      console.log(err);
      process.exit(1);
    }
  });
}

// This is not used
function databaseSave(data) {
	console.log('data', data);
	database.insert(data);
	//database.close()
}

// insertMongoDB is only used to insert the postings
exports.insertMongoDB = function(packet) {
	fbodataCollection.insertMany(packet.data)
		.then(() => {
			console.log('success');
		})
		.catch((err) => {
			//console.log('err', err.message);
		})
		.then(() => {
			// just ignore the errors
			el.emit('finished', 'insert');
		});
}

// createCollection is used to create the needed collections, for now it just does all the collection work instead of being a general function that can be used abstractly
exports.createCollection = function(collName) {
  console.log('Creating collection', collName);

  // Use the abstracted database object declared above to create collections
  database.mdb.collection('counters').insert(
    { _id: "userid",
      seq: 0 }, 
      function(err, records) {
    }
  );

  // Create the data collection; the one we will dump all the FBO postings into
  fbodataCollection = database.mdb.collection('fbodata');
  // Apply an index on the ID, Type, and Date together
  fbodataCollection.createIndex({ ID: 1, Type: 1, Date: 1 }, { unique: true });

  // Create the clients collections; the one we will place clients into
  fboclientsCollection = database.mdb.collection('fboclients');

  // We are now ready to fetch so emit an event for it
  el.emit('fetch');
}

// This is not implemented either
function getLastMongoID() {
	return fbodataCollection.find({}).sort({'ID': -1}).limit(1).next()
		.then(value => {
      		return value.ID;
    	})
	    .catch(() => {
	      return 0;
	    });
}

// This is not used, see line ~170 of the postProcessing() function in the scraper.js file for how the ID is currently set
function getNextSequence(name, row) {
  database.mdb.collection('counters').findAndModify(
    { _id: name },
    undefined,
    { $inc: { seq: 1 } },
    function(err, object) {
      if(!err) {
        row.ID = object.value.seq;
        fbodataCollection.insert(row);
      }
    });
}

// generateClientPages is used when the server first starts up or when the FBO resources are updated for the new day
exports.generateClientPages = function() {
	console.log("Generating client pages...");

	// Find all clients and generate an array from the cursor
	fboclientsCollection.find().toArray((err, clients) => {
		// map the client array to find all documents under each clients specified search terms
		// clients.map((client) => {
		// 	fbodataCollection.find(client.search).toArray((err, documents) => {
		// 		// emit an ASYNC event to generate a new client page
		// 		el.emitAsync('newclientpage', { client: client, data: documents });
		// 	});
		// });

		async.map(clients, (client, callback) => {
			fbodataCollection.find(client.search).toArray((err, documents) => {
				// emit an ASYNC event to generate a new client page
				el.emitAsync('newclientpage', { client: client, data: documents });
			});
		}, (err, results) => {
			console.log(err, results);
		});

	});
}


// upsertClient is a function that is used to UPDATE an existing client or INSERT a new client
exports.upsertClient = function(packet) {
	console.log('Attempting to insert client:', packet.client.personal.netid);

	Promise.resolve(fboclientsCollection.update({ 'personal.netid': packet.client.personal.netid }, packet.client, { upsert: true }))
		.then(() => {
			// Find all documents that fall under the clients search parameters
			fbodataCollection.find(packet.client.search).toArray((err, documents) => {

				// emit an ASYNC event to generate a new client page
				el.emitAsync('newclientpage', { client: packet.client, data: documents });

				// Ideally you want to have this redirect to a new page with a finish event emitted on successful generation which then redirects them
				// emit a response packet containing the NetID for the redirect
				el.emitAsyn('respond', 
					{ 
						res: packet.res,
						responseFunction: () => {
							res.json({ name: packet.client.personal.netid });
						}
					}
				);

				console.log('Inserted client: ', packet.client.personal.netid);
			});

		})
		.catch((err) => {
			console.log('Could not insert client:', packet.client.personal.netid);
			console.log('Error:', err);
		});
}