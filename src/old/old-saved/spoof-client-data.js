var MongoClient = require('mongodb').MongoClient;

// Database object that is used as an abstracted accessor to the Mongo function
var database = {};

database.connect = function(dbname) { connectMongoDB(dbname) };
database.insert = function(data) { insertMongoDB(data) };
database.close = function() { this.mdb.close() };


// FIX THIS AND REARCH IT
// ====== db stuff

function connectMongoDB(dbname) {
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/" + dbname, function(err, mdb) {
    if(!err) {
      console.log('Connected');
      database.mdb = mdb;
      //console.log(mdb);
      createCollection();
    } else {
      console.log(err);
      process.exit(1);
    }
  });
}

// Function to save data in the database
function databaseSave(data) {
	console.log('data', data);
	database.insert(data);
	//database.close()
}

// NEED TO ADD ID STUFF
function insertMongoDB(rows) {
  console.log('inserting...');
  /*fbodataCollection.insert(row, () => {
      console.log('ima muhhhfkin callback son');
    })*/
  fbodataCollection.insert(rows)
    .then(() => {
      console.log('success');
      //tableLength++;
    })
    .catch((err) => {
      console.log('THERE WAS AN ERROR', err);
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

  fbodataCollection = database.mdb.collection('fboclients');
  fbodataCollection.createIndex({'ID': 1}, {unique: true});

  lastID = getLastMongoID();
}

function getLastMongoID() {
  return fbodataCollection.find({}).sort({'ID': -1}).limit(1).next()
    .then(value => {
    	console.log(value.ID);
    	return value.ID + 1;
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

var fbodataCollection;

var clientSpoofMap = [
	{
		ID: 	'0',
		Name: 	'Jensen',
		Email: 	'blahblah@utdallas.edu'
	},
	{
		ID: 	'1',
		Name: 	'Scott',
		Email: 	'scg104020@utdallas.edu'
	}
];

database.connect('fbo-mailer');
setTimeout(function() {
	clientSpoofMap.map((client) => {
		Promise.resolve(getLastMongoID()).then((value) => {
			console.log(value, client);
			database.insert(client);
		});
	});

	//database.insert({ 'ID': thing });
}, 1000);



