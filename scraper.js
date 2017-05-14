/*

	CLEAN UP THIS FILE


*/

// Using request to GET and POST the pages 
var request = require('request');

// Node-Cron is used to call the events at cetain times and fire off the scraping and client emails at certain times
var cron = require('node-cron');

var every = '*';

var date = { 
	minute: '23', 
	hour: 	'22', 
	date: 	'*', 
	month: 	'*', 
	day: 	'*' 
};

// fix this
function schedule() {
	cron.schedule(Object.values(date).join(' '), function(){
		mainEventLoop.emit('start');
	});
}


// Cheerio is used to parse the HTML returned so that it can be more easily scraped without the use of regular expressions and inefficient string parsing
var cheerio = require('cheerio');

// Needed to write some files, will probably be in the production version for log files
var fs = require('fs');

// JSONify is used to make objects out of the strings scraped off the opportunities
var json = require('jsonify');

// MongoDB for the database
var MongoClient = require('mongodb').MongoClient;

// Semaphores to regulate the scraping and fly under the radar (hopefully!)
var Semaphore = require("node-semaphore");

// 2 for getting the pages of opportunities (pre-scraping; don't want to flood the event-loop / queue)
var pagePool = Semaphore(2);

// 10 for fetching the opportunities themselves (actual scaping; don't want to scrape too much at once and get timed out)
var fetchPool = Semaphore(10);

// Using console stamp to provide better print outs for debugging
var cs = require("console-stamp") (console, {
	metadata: function () {
		var funcout = __function;

		return ('[ RAM: ' + (process.memoryUsage().rss  / 1000000).toFixed(2) + ' MB | caller: ' + __function + ' | line: ' + __line + ' ]');
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

// ==========

// Database object that is used as an abstracted accessor to the Mongo function
var database = {};

database.close = function() { this.mdb.close() };
database.insert = function(data) { insertMongoDB(data) };

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


connectMongoDB();

// ======= end db stuff


// ===== event loop stuff

// Using the event-loop for the software architecture
const EventEmitter = require('events');
class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	'page'		: getLinks,			// Get the links of the opportunity off the page
	'fetch'		: parseOpportunity,	// Scrape the data of the article
	'save'		: databaseSave,		// Save the scraped information in the database
	'schedule'	: schedule,
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












// Fomulate yesterday's date; add one to the month because it is zero indexed, subtract one from day to get yesterday's opportunities
var dateVar = new Date();
var date = [dateVar.getFullYear(), dateVar.getMonth() + 1, dateVar.getDate() - 1, ].join('-');

// This is a global var so I don't have to pass it to every event emission when scraping
// JSON form imported from Chrome and subbed using yesterdays date
var jsForm = 
	'{"_____du mmy":"dnf_","so_form_prefix":"dnf_","dnf_opt_action":"search","dnf_opt_template":"7pE4TO+LpSOt6kkfvI3tjzXxVYcDLoQW1MDkvvEnorEEQQXqMlNO+qihNxtVFxhn","dnf_opt_template_dir":"Ni5FF3rCfdHw20ZrcmEfnbG6WrxuiBuGRpBBjyvqt1KAkN/anUTlMWIUZ8ga9kY+","dnf_opt_subform_template":"ofIwRcnIObMpvmYWChWtsWF719zd85B9","dnf_opt_finalize":"1","dnf_opt_mode":"update","dnf_opt_target":"","dnf_opt_validate":"1","dnf_class_values[procurement_notice][dnf_class_name]":"procurement_notice","dnf_class_values[procurement_notice][notice_id]":"fa10da501d41bea54e485d6b274b671f","dnf_class_values[procurement_notice][_so_agent_save_agent]":"","dnf_class_values[procurement_notice][custom_response_date]":"","dnf_class_values[procurement_notice][custom_posted_date]":"","dnf_class_values[procurement_notice][zipstate][]":"","dnf_class_values[procurement_notice][zipcode]":"","dnf_class_values[procurement_notice][searchtype]":"active","dnf_class_values[procurement_notice][set_aside][]":"","dnf_class_values[procurement_notice][procurement_type][]":"","dnf_class_values[procurement_notice][all_agencies]":"all","dnf_class_values[procurement_notice][agency][dnf_class_name]":"agency","_status_43b364da3bd91e392aab74a5af5fd803":"0","dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_input_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_hidden_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","dnf_class_values[procurement_notice][recovery_act]":"","dnf_class_values[procurement_notice][keywords]":"","dnf_class_values[procurement_notice][naics_code][]":"","dnf_class_values[procurement_notice][classification_code][]":"","dnf_class_values[procurement_notice][ja_statutory][]":"","dnf_class_values[procurement_notice][fair_opp_ja][]":"","dnf_class_values[procurement_notice][posted_date][_start]":"' + date + '","dnf_class_values[procurement_notice][posted_date][_start]_real":"' + date + '","dnf_class_values[procurement_notice][posted_date][_end]":"' + date + '","dnf_class_values[procurement_notice][posted_date][_end]_real":"' + date + '","dnf_class_values[procurement_notice][response_deadline][_start]":"","dnf_class_values[procurement_notice][response_deadline][_start]_real":"","dnf_class_values[procurement_notice][response_deadline][_end]":"","dnf_class_values[procurement_notice][response_deadline][_end]_real":"","dnf_class_values[procurement_notice][modified][_start]":"","dnf_class_values[procurement_notice][modified][_start]_real":"","dnf_class_values[procurement_notice][modified][_end]":"","dnf_class_values[procurement_notice][modified][_end]_real":"","dnf_class_values[procurement_notice][contract_award_date][_start]":"","dnf_class_values[procurement_notice][contract_award_date][_start]_real":"","dnf_class_values[procurement_notice][contract_award_date][_end]":"","dnf_class_values[procurement_notice][contract_award_date][_end]_real":""}';

req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

// If the first argument provided is an 'f' then we need to proceed with event-loop scraping of every opportunity from yesterday
// THIS IS HERE AS A PLACEHOLDER; make sure to implement single article and other stuff
if(process.argv[2] == 'f') {
	
} 
// else if(process.argv[2] == 'd') {
// 	mainEventLoop.emit('fetch', 'https://www.fbo.gov/?s=opportunity&mode=form&id=4025738859b0374338abc74c75e82905&tab=core&_cview=0');
// } else {
// 	fs.readFile('testArticle', 'utf8', function(err, contents) {
// 		mainEventLoop.emit('fetch', 'https://www.fbo.gov/index?s=opportunity&mode=form&id=459f3643d517aa73fd2689fc4954e5af&tab=core&_cview=0');
// 	});
// }

function start() {
	// Need to get the webpage first before we can submit the form for some reason ???
	req.get({
		url: 'https://www.fbo.gov/index?s=opportunity&mode=list&tab=search&tabmode=list&='
	}, function(err, resp, body) {
		// Use the form to retrieve the page of opportunities
		req.post({
		    url: 'https://www.fbo.gov/?s=opportunity&mode=list&tab=searchresults&tabmode=list&pp=100',
		    form: jsForm,
		}, function(err, resp, body) {

			console.log(body);

			//console.log('are we here?');

			// load the html into cheerio and extract the number of pages
			var $ = cheerio.load(body)('a[title="last page"]').text().slice(1, 5);

			// Crimp the amount of pages to 10 for testing
			pages = 10;
			// Emit events for each page
			for (var pageNum = 1; pageNum < pages; pageNum++) {
				mainEventLoop.emit('page', { 'pageNum': pageNum });
			}
		});
	});
}

// The gatherData function is fairly complicated; it emits an event with the scraped data 
// It is a bit convoluted, but is essentially just a concatenation of the two output arrays (of single variable objects) stamped into one object using the Object.assign() function, thus ending up with one object that has all the mappings of the data. Technically the entire function is a one-liner.
function gatherData(url, $) {
	console.log('gatherData for', url);
	//console.log(url, $());
	mainEventLoop.emit('save', Object.assign(...
		//console.log(Object.assign(...
		[].slice.call($('.fld-ro').map((index, item) => {
			var ic = $(item).children();
			// make this a one liner too brah
			//console.log($(item));

			if(!$(item).attr('id').includes('packages')) {
				//console.log($(item).attr('id'));
				return { [$(ic[0]).text().trim().replace(':', '').replace('.', '')] : $(ic[1]).text().trim() };
			}

		}))
		.concat(
		[].slice.call($('.agency-name').contents().map((index, item) => {
			//condition && (x = true);

			// try to play around with this an make it a one liner, use this shit for now
			if ($(item).text().trim()) {

				// Compare the runtime of these two
			 	return JSON.parse(('{"' + $(item).text() + '"}').replace(': ', '":"'));
			 	//return JSON.parse(('{"' + item['data'] + '"}').replace(': ', '":"'));
			}
		})))
	));
}

// Retrieve the links off of the next page given the page ID
function getLinks(packet) {
	console.log('getting links for:', packet.pageNum);
	// Take one from the pool and (abstracted) decrement the semaphore allowance
	pagePool.acquire(function() {
		// Post to the page ID
		req.post({
			url: "https://www.fbo.gov/index?s=opportunity&mode=list&tab=searchresults&tabmode=list&pp=100&pageID=" + packet.pageNum,
			form: jsForm,
		}, function(err, resp, body) {
			// We are done retrieving the page; release the page now for the fastest processing since we don't care about flooding the local resources
			pagePool.release();

			// Use cheerio to load the page and scrape all links from the page, amend each string and emit a 'fetch' event for each
			cheerio.load(body)('.lst-lnk-notice').map((index, item) => {
				mainEventLoop.emit('fetch', 'https://www.fbo.gov/index' + item['attribs']['href']);
			});

		});	
	});
}

// Fired on each 'fetch' event, this get the page and will call the gatherData function to scrape all the usable data
function parseOpportunity(opportunity) {
	// Take one from the pool and (abstracted) decrement the semaphore allowance 
	fetchPool.acquire(function() {
		// Get the url given
		req.get({ url: opportunity }, function(err, resp, body) {
			// Scrape all the data from the page
			gatherData(opportunity, cheerio.load(body));
			// Release now because I don't care about flooding the local resources in the event-loop
			fetchPool.release();
		});
	});
}
