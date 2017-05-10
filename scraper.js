/*

	CLEAN UP THIS FILE


*/


var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var json = require('jsonify');

// MongoDB for the database
var MongoClient = require('mongodb').MongoClient;

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
      console.log(mdb);
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


































req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

if(process.argv[2] == 'f') {
	req.get({
	    url: "https://www.fbo.gov/index?s=opportunity&mode=list&tab=search&tabmode=list&=",
	    headers: {
	        'User-Agent': 'Super Cool Browser' // optional headers
	     }
	  }, function(err, resp, body) {
		
		// load the html into cheerio
		var $ = cheerio.load(body);
		
		// get the data and output to console
		//console.log( 'IP: ' + $('.inner_cntent:nth-child(1) span').text() );
		//console.log( 'Host: ' + $('.inner_cntent:nth-child(2) span').text() );
		//console.log( 'UA: ' + $('.browser span').text() );
		//console.log($);

		var jsForm = 
		'{"_____dummy":"dnf_","so_form_prefix":"dnf_","dnf_opt_action":"search","dnf_opt_template":"7pE4TO+LpSOt6kkfvI3tjzXxVYcDLoQW1MDkvvEnorEEQQXqMlNO+qihNxtVFxhn","dnf_opt_template_dir":"Ni5FF3rCfdHw20ZrcmEfnbG6WrxuiBuGRpBBjyvqt1KAkN/anUTlMWIUZ8ga9kY+","dnf_opt_subform_template":"ofIwRcnIObMpvmYWChWtsWF719zd85B9","dnf_opt_finalize":"1","dnf_opt_mode":"update","dnf_opt_target":"","dnf_opt_validate":"1","dnf_class_values[procurement_notice][dnf_class_name]":"procurement_notice","dnf_class_values[procurement_notice][notice_id]":"fa10da501d41bea54e485d6b274b671f","dnf_class_values[procurement_notice][_so_agent_save_agent]":"","dnf_class_values[procurement_notice][custom_response_date]":"","dnf_class_values[procurement_notice][custom_posted_date]":"","dnf_class_values[procurement_notice][zipstate][]":"","dnf_class_values[procurement_notice][zipcode]":"","dnf_class_values[procurement_notice][searchtype]":"active","dnf_class_values[procurement_notice][set_aside][]":"","dnf_class_values[procurement_notice][procurement_type][]":"","dnf_class_values[procurement_notice][all_agencies]":"all","dnf_class_values[procurement_notice][agency][dnf_class_name]":"agency","_status_43b364da3bd91e392aab74a5af5fd803":"0","dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_input_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_hidden_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","dnf_class_values[procurement_notice][recovery_act]":"","dnf_class_values[procurement_notice][keywords]":"","dnf_class_values[procurement_notice][naics_code][]":"","dnf_class_values[procurement_notice][classification_code][]":"","dnf_class_values[procurement_notice][ja_statutory][]":"","dnf_class_values[procurement_notice][fair_opp_ja][]":"","dnf_class_values[procurement_notice][posted_date][_start]":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_start]_real":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_end]":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_end]_real":"2017-05-08","dnf_class_values[procurement_notice][response_deadline][_start]":"","dnf_class_values[procurement_notice][response_deadline][_start]_real":"","dnf_class_values[procurement_notice][response_deadline][_end]":"","dnf_class_values[procurement_notice][response_deadline][_end]_real":"","dnf_class_values[procurement_notice][modified][_start]":"","dnf_class_values[procurement_notice][modified][_start]_real":"","dnf_class_values[procurement_notice][modified][_end]":"","dnf_class_values[procurement_notice][modified][_end]_real":"","dnf_class_values[procurement_notice][contract_award_date][_start]":"","dnf_class_values[procurement_notice][contract_award_date][_start]_real":"","dnf_class_values[procurement_notice][contract_award_date][_end]":"","dnf_class_values[procurement_notice][contract_award_date][_end]_real":""}';

		console.log(JSON.parse(jsForm));
		//process.exit();
		var form = $('#vendor_procurement_notice_search').serializeArray();
		console.log($(form).serializeArray());


		var newform = Object.assign(...$('#vendor_procurement_notice_search').serializeArray().map((item, index) => {
			//console.log(index, item);
			console.log();

			return {[item.name]: item.value};
		}));

		/*
		newform['_month_dnf_class_values[procurement_notice][posted_date][_start]'] = '05';
  		newform['_day_dnf_class_values[procurement_notice][posted_date][_start]'] = '05';
  		newform['_year_dnf_class_values[procurement_notice][posted_date][_start]'] = '2017';
		*/
		jsForm['dnf_class_values[procurement_notice][posted_date][_start]'] = '2017-05-10';
		jsForm['dnf_class_values[procurement_notice][posted_date][_start]_real'] = '2017-05-10';
		/*
		newform['_month_dnf_class_values[procurement_notice][posted_date][_end]'] = '05';
  		newform['_day_dnf_class_values[procurement_notice][posted_date][_end]'] = '05';
  		newform['_year_dnf_class_values[procurement_notice][posted_date][_end]'] = '2017';
		*/
		jsForm['dnf_class_values[procurement_notice][posted_date][_end]'] = '2017-05-10';
		jsForm['dnf_class_values[procurement_notice][posted_date][_end]_real'] = '2017-05-10';

		jsForm['dnf_opt_finalize'] = 1;
		//newform['dnf_opt_validate'] = 0;

		// newform['dnf_class_values[procurement_notice][posted_date][_start]_real'] = '2017-05-05';
		// newform['dnf_class_values[procurement_notice][posted_date][_end]_real'] = '2017-05-05';


		//newform['dnf_class_values[procurement_notice][custom_posted_date]'] = '2017-05-05';

		//console.log(jsForm);
		//process.exit();

		req.post({
		    url: "https://www.fbo.gov/?s=opportunity&mode=list&tab=searchresults&tabmode=list&pp=100",
		    form: jsForm,
		    headers: {
		        'User-Agent': 'Super Cool Browser' // optional headers
		     }
		  }, function(err, resp, body) {

		 //  	fs.writeFile("test", body, function(err) {
			//     if(err) {
			//         return console.log(err);
			//     }

			//     console.log("The file was saved!");
			// });
			
			// load the html into cheerio
			var $ = cheerio.load(body);

			var pages = $('a[title="last page"]').text().slice(1, 5);

			if(pages > 10) {
				pages = 10 + 1;

				for(var pageNum = 1; pageNum < pages; pageNum++) {
					mainEventLoop.emit('page', { 'pageNum': pageNum, 'form': jsForm });
				}

			}

			//console.log(body);

			//console.log();

			//var thing = $($('.lst-cnt')[0]).text(); 

			//console.log(thing);
			
				// [].slice.call($('.lst-lnk-notice')).map((item, index) => {
				// 	console.log('submitting: ', $(item).attr('href'), index);
				// 	mainEventLoop.emit('fetch', 'https://www.fbo.gov/' + $(item).attr('href'))
				// });
			
			//mainEventLoop.emit('fetch', 'https://www.fbo.gov/index?s=opportunity&mode=form&id=459f3643d517aa73fd2689fc4954e5af&tab=core&_cview=0')





			//var list = $('.lst-rw');
			//console.log(list);

			// [].slice.call(list).map((row, index) => {
			// 	console.log(row.)
			// });

			//[].slice.call($('.lst-rw')).map((row, index) => {return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {return {[attributeList[index]]: item};})));});


			// [].slice.call($('.lst-rw')).map((row, index) => {
			// 	return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {
			// 		return {[attributeList[index]]: item};
			// 	}))); 
			// });

			//[].slice.call($('.lst-rw')).map((row, index) => {
				// return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {
				// 	return {[attributeList[index]]: item};
				// }))); 

				//console.log(index, row);

			//});

			//var children = $(list[0]).children();

			// children.map((child) => {
			// 	//console.log($(children[child]).text().trim());
			
			// 	console.log($(children)[child].children())
			// });

			//console.log($(children[0]).children().text());
			// var text = $('.lst-rw').contents().map(function() {
			//         return $(this).text().trim()
			// }).get();

			//var elements = ['solt', 'soln', 'solcc', 'lst-lnk-notice', 'pagency'];


				// revamp this to just fetch the links and then get everything from the link since it is more straight forward and we already have
				// to load the link anyways


				// var information = Object.assign(...[].slice.call(document.getElementsByClassName('fld-ro')).map((item, index) => {
				// 	return {[item.children[0].innerText.replace(':', '').trim()]: item.children[1].innerText.trim()}
				// }).concat($('.agency-name').innerText.split('\n').map((item) => {
				// 	var itemsplit = item.split(':')
				// 	return {[itemsplit[0].trim()]: itemsplit[1].trim()}
				// })))

				var url;

				/*req.get({
				    url: 'https://www.fbo.gov/?s=opportunity&mode=form&id=4025738859b0374338abc74c75e82905&tab=core&_cview=0',
				    headers: {
				        'User-Agent': 'Super Cool Browser' // optional headers
				     }
				}, function(err, resp, body) {

				  	fs.writeFile("testArticle", body, function(err) {
					    if(err) {
					        return console.log(err);
					    }

					    console.log("The file was saved!");
					});

				  	gatherData(cheerio.load(body));
				});*/

				// 	console.log()
				// 	console.log()

				// var rowObjs = [];
				// // ----- first box
				// $('.lst-rw').map((index, item) => {
				// 	var link;
				// 	var array = ($($(item).children()[0]).children().children().map((index, item) => {
				// 		//console.log(index, $(item).text());

				// 		link = 'https://www.fbo.gov/' + $(item).parent().attr('href');
				// 		return $(item).text().trim();
				// 	}).get());	

				// 	// Insert the unique ID from the database insertion mongo meh ehhh
				// 	rowObjs.push({'Title': array[0], 'Solicitation ID': array[1], 'Classification Code': array[2], 'Link': link});	
				// });


				// // ---- agency
				// $('.pagency').each((index, item) => {
				// 	rowObjs[index]['Agency'] = $(item).text().trim();
				// });

				// // ----- type
				// $('.lst-cl[headers=lh_base_type]').each((index, item) => {
				// 	rowObjs[index]['Type'] =  $(item).text().trim();
				// });

				// // ----- dates
				// $('.lst-cl-first_sort').each((index, item) => {
				// 	rowObjs[index]['Posted Date'] =  $(item)[0]['children'][0]['data'].trim();
				// });

				// console.log(rowObjs);

				// console.log(rowObjs[0]['Link']);


				// var properties = {
				// 	'Notice': ''
				// }



				// req.get({
				//     url: rowObjs[0]['Link'],
				//     headers: {
				//         'User-Agent': 'Super Cool Browser' // optional headers
				//      }
				//   }, function(err, resp, body) {
				// 	  	var $ = cheerio.load(body);

				// 		console.log(body);

				// 		console.log();


				// 		rowObjs[0]['Set Aside'] = $('#dnf_class_values_procurement_notice__set_aside__widget').text().trim();
				// 		rowObjs[0]['Synopsis'] = $('#dnf_class_values_procurement_notice__description__widget').text().trim();
				// 		rowObjs[0]['Point of Contact'] = $('#dnf_class_values_procurement_notice__poc_text__widget').text().trim().split(',').reverse().join(' ');

				// 		console.log(rowObjs[0])
				//   });
		});
	});

} else if(process.argv[2] == 'd') {
	mainEventLoop.emit('fetch', 'https://www.fbo.gov/?s=opportunity&mode=form&id=4025738859b0374338abc74c75e82905&tab=core&_cview=0');
} else {
	fs.readFile('testArticle', 'utf8', function(err, contents) {
		mainEventLoop.emit('fetch', 'https://www.fbo.gov/index?s=opportunity&mode=form&id=459f3643d517aa73fd2689fc4954e5af&tab=core&_cview=0');
	});
}


function databaseSave(data) {
	console.log('data', data);
	database.insert(data);
	//database.close()
}


function gatherData($) {
	mainEventLoop.emit('save', Object.assign(...
		[].slice.call($('.fld-ro').map((index, item) => {
			var ic = $(item).children();
			// make this a one liner too brah
			console.log($(item));

			if(!$(item).attr('id').includes('packages')) {
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


	/*
	req.post({
		    url: "https://www.fbo.gov/index?s=opportunity&mode=list&tab=searchresults&tabmode=list&pp=20&pageID=" + pageNum,
		    form: jsForm,
		    headers: {
		        'User-Agent': 'Super Cool Browser' // optional headers
		     }
		  }, function(err, resp, body) {

		 //  	fs.writeFile("test", body, function(err) {
			//     if(err) {
			//         return console.log(err);
			//     }

			//     console.log("The file was saved!");
			// });
			
			// load the html into cheerio
			var $ = cheerio.load(body);

			var pages = $('a[title="last page"]').text().slice(1, 5);

			if(pages > 10) {
				pages = 10;
			}
		}
	
	*/
}


function parseOpportunity(opportunity) {

	console.log(opportunity);

	// var that = req.get({
	//     url: url
	// }, function(err, resp, body) {
	// 	$ = cheerio.load(body);

	// 	return Object.assign(...
	// 		[].slice.call($('.fld-ro').map((index, item) => {
	// 			var ic = $(item).children();
	// 			// make this a one liner too brah
	// 			//console.log(ic);

	// 			return {[$(ic[0]).text().trim().replace(':', '')] : $(ic[1]).text().trim()};
	// 		}))
	// 	.concat(
	// 		[].slice.call($('.agency-name').contents().map((index, item) => {
	// 			//condition && (x = true);

	// 			// 	// try to do it like this later:
	// 			// 	// str.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"').replace(/([^:][a-z]*)(?=\s*:)/g, '"$1"')

	// 			// try to play around with this an make it a one liner, use shit for now
	// 			if ($(item).text().trim()) {
	// 			 	return JSON.parse(('{"' + $(item).text() + '"}').replace(': ', '":"'));
	// 			}
	// 		})))
	// 	);
	// });

	// console.log(that);

	req.get({ url: opportunity }, function(err, resp, body) {
		gatherData(cheerio.load(body));
	});
}
