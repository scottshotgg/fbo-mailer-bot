/*

	CLEAN UP THIS FILE


*/


var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var json = require('jsonify');

// MongoDB for the database
var MongoClient = require('mongodb').MongoClient;

var Semaphore = require("node-semaphore");
var pagePool = Semaphore(2);
var fetchPool = Semaphore(10);


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

// ==========


var database = {};

database.close = function() { this.mdb.close() };
database.insert = function(data) { insertMongoDB(data) };

console.log(database);

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
      console.log(err);
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
// Event loop extension
const EventEmitter = require('events');

class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

eventLoopFunctions = {
	'page' : getLinks,
	'fetch': parseOpportunity,
	'save' : databaseSave,

};

// Function to seperate function loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();













var dateVar = new Date();
var date = [dateVar.getFullYear(), dateVar.getMonth() + 1, dateVar.getDate(), ].join('-');

// This is a global var so I don't have to pass it to every event emission
var jsForm = 
	'{"_____dummy":"dnf_","so_form_prefix":"dnf_","dnf_opt_action":"search","dnf_opt_template":"7pE4TO+LpSOt6kkfvI3tjzXxVYcDLoQW1MDkvvEnorEEQQXqMlNO+qihNxtVFxhn","dnf_opt_template_dir":"Ni5FF3rCfdHw20ZrcmEfnbG6WrxuiBuGRpBBjyvqt1KAkN/anUTlMWIUZ8ga9kY+","dnf_opt_subform_template":"ofIwRcnIObMpvmYWChWtsWF719zd85B9","dnf_opt_finalize":"1","dnf_opt_mode":"update","dnf_opt_target":"","dnf_opt_validate":"1","dnf_class_values[procurement_notice][dnf_class_name]":"procurement_notice","dnf_class_values[procurement_notice][notice_id]":"fa10da501d41bea54e485d6b274b671f","dnf_class_values[procurement_notice][_so_agent_save_agent]":"","dnf_class_values[procurement_notice][custom_response_date]":"","dnf_class_values[procurement_notice][custom_posted_date]":"","dnf_class_values[procurement_notice][zipstate][]":"","dnf_class_values[procurement_notice][zipcode]":"","dnf_class_values[procurement_notice][searchtype]":"active","dnf_class_values[procurement_notice][set_aside][]":"","dnf_class_values[procurement_notice][procurement_type][]":"","dnf_class_values[procurement_notice][all_agencies]":"all","dnf_class_values[procurement_notice][agency][dnf_class_name]":"agency","_status_43b364da3bd91e392aab74a5af5fd803":"0","dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_input_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_hidden_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","dnf_class_values[procurement_notice][recovery_act]":"","dnf_class_values[procurement_notice][keywords]":"","dnf_class_values[procurement_notice][naics_code][]":"","dnf_class_values[procurement_notice][classification_code][]":"","dnf_class_values[procurement_notice][ja_statutory][]":"","dnf_class_values[procurement_notice][fair_opp_ja][]":"","dnf_class_values[procurement_notice][posted_date][_start]":"' + date + '","dnf_class_values[procurement_notice][posted_date][_start]_real":"' + date + '","dnf_class_values[procurement_notice][posted_date][_end]":"' + date + '","dnf_class_values[procurement_notice][posted_date][_end]_real":"' + date + '","dnf_class_values[procurement_notice][response_deadline][_start]":"","dnf_class_values[procurement_notice][response_deadline][_start]_real":"","dnf_class_values[procurement_notice][response_deadline][_end]":"","dnf_class_values[procurement_notice][response_deadline][_end]_real":"","dnf_class_values[procurement_notice][modified][_start]":"","dnf_class_values[procurement_notice][modified][_start]_real":"","dnf_class_values[procurement_notice][modified][_end]":"","dnf_class_values[procurement_notice][modified][_end]_real":"","dnf_class_values[procurement_notice][contract_award_date][_start]":"","dnf_class_values[procurement_notice][contract_award_date][_start]_real":"","dnf_class_values[procurement_notice][contract_award_date][_end]":"","dnf_class_values[procurement_notice][contract_award_date][_end]_real":""}';

//console.log(jsForm);

req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

if(process.argv[2] == 'f') {
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

			// load the html into cheerio
			var $ = cheerio.load(body);

			// Extract the number of pages we need to scrape
			var pages = $('a[title="last page"]').text().slice(1, 5);

			// if(pages > 10)
			// 	pages = 10 + 1;
			pages = 10;
			// Emit events for each page
			for (var pageNum = 1; pageNum < pages; pageNum++) {
				mainEventLoop.emit('page', { 'pageNum': pageNum });
			}
		});
	});

	// mainEventLoop.emit('fetch', 'https://www.fbo.gov/index?s=opportunity&mode=form&id=7795a367ef1acaf4d9a43afe61ea20f7&tab=core&_cview=1');

} 
// else if(process.argv[2] == 'd') {
// 	mainEventLoop.emit('fetch', 'https://www.fbo.gov/?s=opportunity&mode=form&id=4025738859b0374338abc74c75e82905&tab=core&_cview=0');
// } else {
// 	fs.readFile('testArticle', 'utf8', function(err, contents) {
// 		mainEventLoop.emit('fetch', 'https://www.fbo.gov/index?s=opportunity&mode=form&id=459f3643d517aa73fd2689fc4954e5af&tab=core&_cview=0');
// 	});
// }


function databaseSave(data) {
	console.log('data', data);
	database.insert(data);
	//database.close()
}


function gatherData(url, $) {
	console.log('gatherData for', url);
	console.log(url, $());
	mainEventLoop.emit('save', Object.assign(...
		[].slice.call($('.fld-ro').map((index, item) => {
			var ic = $(item).children();
			// make this a one liner too brah
			//console.log($(item));

			if(!$(item).attr('id').includes('packages')) {
				console.log($(item).attr('id'));
				return { [$(ic[0]).text().trim().replace(':', '').replace('.', '')] : $(ic[1]).text().trim() };
			}

		}))
		.concat(
		[].slice.call($('.agency-name').contents().map((index, item) => {
			//condition && (x = true);

			// 	// try to do it like this later:
			// 	// str.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"').replace(/([^:][a-z]*)(?=\s*:)/g, '"$1"')

			// try to play around with this an make it a one liner, use shit for now
			if ($(item).text().trim()) {
			 	return JSON.parse(('{"' + $(item).text() + '"}').replace(': ', '":"'));
			}
		})))
	));
}


function getLinks(packet) {
	console.log('getting links for:', packet.pageNum);



	// pool.acquire(function() {
	// 	console.log("Queueing...", packet.pageNum);

	// 	setTimeout(function(){
	// 	    //do what you need here
	// 	    console.log('releasing...', packet.pageNum);
	// 	    pool.release();
	// 	}, 2000);
	// });

	pagePool.acquire(function() {
		req.post({
			url: "https://www.fbo.gov/index?s=opportunity&mode=list&tab=searchresults&tabmode=list&pp=100&pageID=" + packet.pageNum,
			form: jsForm,
		}, function(err, resp, body) {
			pagePool.release();

			var $ = cheerio.load(body);

			var opps = $('.lst-lnk-notice').map((index, item) => {
				mainEventLoop.emit('fetch', 'https://www.fbo.gov/index' + $(item).attr('href'));
			});

		});	
	});
}


function parseOpportunity(opportunity) {
	fetchPool.acquire(function() {
		req.get({ url: opportunity }, function(err, resp, body) {
			gatherData(opportunity, cheerio.load(body));
			fetchPool.release();
		});
	});
}
