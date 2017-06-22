// Express is used to host the website, we do not want to use Apache or w/e
// http://expressjs.com/en/api.html#res.download

var express = require('express');
var pathing = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var md5 = require("blueimp-md5");

var el = require('./eventloop-events')


function validateName(name) {
	return /^[a-zA-Z]+$/.test(name);
}

function validateNetID(netid) {
	return (netid.length == 9 && /^[a-zA-Z]+$/.test(netid.substring(0, 3)) && /^[0-9]+$/.test(netid.substring(3)));
}

function validateEmail(email) {
	var emailsplit = email.split('@');
	return (email.length == 22 && validateNetID(emailsplit[0]) && emailsplit[1] == 'utdallas.edu');
}

function validatePassword(password) {
	return password.length > 8;
}

function validatePersonal(personal) {
	return (
		validateName(personal.firstname) &&
		validateNetID(personal.netid) &&
		validateEmail(personal.email) &&
		validatePassword(personal.password) &&
		validatePassword(personal.confirm_password)
	);
}

// put this here temporarily; using this function to respond to the client request
exports.respond = function(packet) {
	res = packet.res;
	console.log(packet, packet.run);
	packet.responseFunction();
}


exports.startServer = function() {
	console.log('Starting server...');

	var app = express();
	var router = express.Router();

	// change this to use better pathing I guess, this should also get the current directory
	app.use("/clients", express.static(pathing.join(__dirname, 'clients')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(session({ secret: "Shh, its a secret!" }));
	// Make a template for this
	app.use(function (err, req, res, next) {
	  console.error(err.stack);
	  res.status(404).sendFile(__dirname + '/resources/templates/404.html');
	});

	app.get('/', function (req, res, next) {
		if(req.session.client == undefined) {
			req.session.client = {};
			res.redirect('/login');
		}
		else if(req.session.client.personal != undefined) {
			res.redirect('/' + req.session.client.personal.netid);
		} else {
			// app.pathing('/signup');
			// next('/signup');
			res.redirect('/login');
		}
	});

	app.post('/validate_personal', function (req, res) {
		req.session.client = {};

		console.log('validate_personal');
		if(validatePersonal(req.body)) {
			req.session.client.personal = req.body;
			res.status(201).end();
		} else {
			res.status(400).end();
		}
	});

	app.post('/validate_login', function (req, res) {
		console.log('validate_login');
		console.log(req.body);

		// this is suseptible to ddos/spamming
		Promise.resolve(fboclientsCollection.findOne({ "personal.netid": req.body.netid }, (err, client) => {
			if(client != null && req.body.password == client.personal.password) {
				// Object.keys(client).map((key, id) => {
				// 	// im lazy so just copy the session out of the database for now
				// 	req.session.client[key] = client[key];
				// });

				// not sure if its a good idea to send everything back to them
				req.session.client = client;
				res.status(201).end();	
			} else {
				res.status(400).end();
			}

		}));
	});

	// still need to have some way to validate the data in here
	app.post('/validate_search', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			console.log('validate_search', req.body);

			req.session.client.search = req.body;
			console.log(req.session.client);
			// For some reason this works ???
			res.status(201).end();
		} else {
			res.status(403).end();
		}
	});

	app.post('/validate_display', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined && req.session.client.search != undefined) {

			console.log('validate_display', req.body);

			console.log(req.body);

			req.session.client.display = req.body;
			console.log(req.session.client);
			// For some reason this works ???

			// database stuff

			// put this for the clients thing
			// Promise.resolve(fboclientsCollection.find({}, (err, cursor) => {
			// 	cursor.toArray().then((documents) => {
			// 		console.log(documents);
			// 		res.json('');
			// 	})
			// }));

			el.emit('upsertdata', { 'client': req.session.client, 'res': res });

		} else {
			res.sendStatus(403).end();
		}
	});

	/*function generateNewClientPage(client, documents) {
		console.log(client);
		sendEmail(client, documents);
	}*/

	app.get('/index.template.js', function (req, res) {
		res.sendFile(__dirname + '/resources/templates/index.template.js');
	});

	app.get('/md5.min.js', function (req, res) {
		res.sendFile(__dirname + '/signup/md5.min.js');
	});

	app.get('/md5.min.js.map', function (req, res) {
		res.sendFile(__dirname + '/signup/md5.min.js.map');
	});

	app.get('/signup', function (req, res) {
		res.sendFile(__dirname + '/signup/signup.html');
	});

	app.get('/signup.js', function (req, res) {
		res.sendFile(__dirname + '/signup/signup.js');
	});

	app.get('/login', function (req, res) {
		res.sendFile(__dirname + '/signup/login.html');
	});

	app.get('/logout', function (req, res) {
		console.log('logout');
		//res.sendFile(__dirname + '/signup/logout.html');
		console.log(req.session.client);
		req.session.client = {};
		res.redirect('/');
	});

	app.get('/logout.js', function (req, res) {
		res.sendFile(__dirname + '/signup/logout.js');
	});

	app.get('/login.js', function (req, res) {
		res.sendFile(__dirname + '/signup/login.js');
	});

	// app.post('/modify_search_preferences', function (req, res) {
	// 	console.log('hi its me, the post request');
	// 	if(req.session.client != undefined && req.session.client.search)
	// 		res.location('/search_preferences').json(req.session.client.search).end();
	// 	/*
	// 	if(req.session.client != undefined && req.session.client.personal != undefined) {
	// 		res.sendFile(__dirname + '/signup/search_preferences.html');
	// 	} else {
	// 		res.redirect('/');
	// 	}
	// 	*/
	// });

	app.get('/search_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			res.sendFile(__dirname + '/signup/search_preferences.html');
		} else {
			res.redirect('/');
		}
	});

	app.get('/search_preferences.js', function (req, res) {
		res.sendFile(__dirname + '/signup/search_preferences.js');
	});

	app.get('/search_preferences.css', function (req, res) {
		res.sendFile(__dirname + '/signup/search_preferences.css');
	});

	app.post('/get_search_preferences', function (req, res) {
		//res.sendStatus(204);
		// idk do we need checks before these?
		if(req.session.client != undefined && req.session.client.search != undefined)
			res.json(req.session.client.search);
	});

	app.get('/modify_search_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			res.sendFile(__dirname + '/signup/search_preferences.html');
		} else {
			res.redirect('/');
		}
	});

	app.get('/display_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined && req.session.client.search != undefined) {
			res.sendFile(__dirname + '/signup/display_preferences.html');
		} else {
			res.redirect('/');
		}
	});

	app.get('/display_preferences.js', function (req, res) {
		res.sendFile(__dirname + '/signup/display_preferences.js');
	});

	app.get('/display_preferences.css', function (req, res) {
		res.sendFile(__dirname + '/signup/display_preferences.css');
	});

	app.post('/get_display_preferences', function (req, res) {
		//res.sendStatus(204);
		if(req.session.client != undefined && req.session.client.search != undefined)
			res.json(req.session.client.display);
	});

	app.get('/modify_display_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			res.sendFile(__dirname + '/signup/display_preferences.html');
		} else {
			res.redirect('/');
		}
	});


	app.get('/data.json', function (req, res) {
		res.sendFile(__dirname + '/signup/data.json');
	});

	app.get('/fboform', function (req, res) {

		console.log(req.session.client.personal);

		//console.log('viewse', req.session.client.views);
		res.sendFile(__dirname + '/signup/fboform.html');
	});

	app.post('/submit', function (req, res) {
		// now we put the checkboxes and drop it into the database

	});

	app.get('/favicon.ico', function(req, res) {
	    res.sendStatus(204);
	});

	app.get('/:id', function (req, res) {
		console.log("Serving user:", req.url);
		res.sendFile(__dirname + '/clients/' + req.url.toLowerCase() + '/index.html');
	});

	app.listen(8080, function () {
	  console.log('Listening on port 8080!');
	});
}