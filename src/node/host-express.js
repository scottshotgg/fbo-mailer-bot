/*
	This file serves as the scrapers ability to host web pages

	Express is used to host the website, we do not want to use Apache or w/e
	http://expressjs.com/en/api.html#res.download
*/

// Used to validate given names; first and last
function validateName(name) {
	return /^[a-zA-Z]+$/.test(name);
}

// Used to validate a given NetID; this could also be expanded to include external validation to the UTD servers
function validateNetID(netid) {
	return (netid.length == 9 && /^[a-zA-Z]+$/.test(netid.substring(0, 3)) && /^[0-9]+$/.test(netid.substring(3)));
}

// Used to validate a given email address
function validateEmail(email) {
	var emailsplit = email.split('@');
	// Since their email should be [NETID]@UTDALLAS.EDU then we should be able to split it and check both independently
	return (email.length == 22 && validateNetID(emailsplit[0]) && emailsplit[1] == 'utdallas.edu');
}

// Used to validate a given password; this may be moot now since we hash on the 1 side
function validatePassword(password) {
	return password.length > 8;
}

// Used to validate all personal information
function validatePersonal(personal) {
	return (
		validateName(personal.firstname) &&
		validateNetID(personal.netid) &&
		validateEmail(personal.email) &&
		validatePassword(personal.password) &&
		validatePassword(personal.confirm_password) &&
		personal.password == personal.confirm_password
	);
}

// Make this async and then make the server start based on when all these come back
function loadDirectories(srcpath, app) {
	fs.readdirSync(srcpath).map((dir) => {
		console.log('Sourcing directory: ', path.join(srcpath, dir));
		app.use(express.static(path.join(srcpath, dir)));
	});
}

// put this here temporarily; using this function to respond to the client request
exports.respond = function(packet) {
	res = packet.res;
	//console.log(packet, packet.run);
	packet.responseFunction();
}

// startServer starts the express instance and sets up all supporting function. This includes the GET, POST, and PUT declaratives and their associated functions, as well as the cookie handling and bodyParsing function
exports.startServer = function() {
	console.log('Starting server...');

	var app = express();
	var router = express.Router();	

	async.map([jsDir, cssDir, fontsDir, dataTablesDir],
		(item, callback) => {
			loadDirectories(item, app);
			callback(null, item);
		},
		(err, results) => { console.log('Done loading resource files!') });

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(session({ secret: "Shh, its a secret!" }));

	//console.log(path);

	// Root directory
	app.get('/', function (req, res, next) {
		// If there isn't any client data, redirect the client to the login page, else if they have personal information then direct them to their home page (this has a hole in the signup where they have personal information but nothing else), else just send them to the login page
		// clean/optimize this
		if(req.session.client == undefined) {
			req.session.client = {};
			res.redirect('/login');
		}
		else if(req.session.client.personal != undefined) {
			res.redirect('/' + req.session.client.personal.netid);
		} else {
			// app.path('/signup');
			// next('/signup');
			res.redirect('/login');
		}
	});

	// The /validate_personal handle is used to validate the personal information entered during signup
	app.post('/validate_personal', function (req, res) {
		Promise.resolve(fboclientsCollection.findOne({ "personal.netid": req.body.netid }, (err, client) => {
			if(client != null) {
				res.status(409).json({error: 'NetID already has an associated account created.'});
			} else {
				req.session.client = {};

				console.log('validate_personal');
				if(validatePersonal(req.body)) {
					req.session.client.personal = req.body;
					res.status(201).json({ location: '/search_preferences' });
				} else {
					res.status(400).end();
				}
			}
		}));
	});

	// The /validate_login handle is used to validate the information entered in the login screen
	app.post('/validate_login', function (req, res) {
		console.log('validate_login');

		// this is suseptible to ddos/spamming, some steps have been taken client side to reduce it, but of course script kitties will get past that
		// Find out whether the client exists based on the NetID entered
		Promise.resolve(fboclientsCollection.findOne({ "personal.netid": req.body.netid }, (err, client) => {
			// Set their information in the res if it is a valid NetID and the entered password hash is the same as the one on file, else send a 400 back
			if(client != null && req.body.password == client.personal.password) {
				req.session.client = client;
				res.status(201).end();	
			} else {
				res.status(400).end();
			}

		}));
	});

	// This has no actual validation currently
	// The /validate_search handle is used to validate the search terms
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

	// This is what fires the client insertion event
	// The /validate_display handle is used to validate the display terms
	app.post('/validate_display', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined && req.session.client.search != undefined) {

			console.log('validate_display', req.body);

			console.log(req.body);

			req.session.client.display = req.body;
			console.log(req.session.client);

			el.emit('upsertclient', { 'client': req.session.client, 'res': res });

		} else {
			res.sendStatus(403).end();
		}
	});

	// All functions/handles below are used to serve the respective files

	app.get('/index.template.js', function (req, res) {
		res.sendFile('index.template.js', { root: templatesDir + 'index/' });
	});

	app.get('/login', function (req, res) {
		res.sendFile('login.html', { root: loginDir });
	});

	app.get('/login.js', function (req, res) {
		res.sendFile('login.js', { root: loginDir });
	});

	app.get('/logout', function (req, res) {
		console.log('logout');
		//res.sendFile(__dirname + '/signup/logout.html');
		console.log(req.session.client);
		req.session.client = {};
		res.redirect('/');
	});

	app.get('/signup', function (req, res) {
		res.sendFile('signup.html', { root: signupDir });
	});

	app.get('/signup.js', function (req, res) {
		res.sendFile('signup.js', { root: signupDir });
	});

	app.get('/search_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
		res.sendFile('search_preferences.html', { root: signupDir + 'search/' });
		} else {
			res.redirect('/');
		}
	});

	app.get('/search_preferences.js', function (req, res) {
		res.sendFile('search_preferences.js', { root: signupDir + 'search/' });
	});

	app.get('/search_preferences.css', function (req, res) {
		res.sendFile('search_preferences.css', { root: signupDir + 'search/' });
	});

	app.get('/modify_search_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			res.sendFile('search_preferences.html', { root: signupDir + 'search/' });
		} else {
			res.redirect('/');
		}
	});

	app.post('/get_search_preferences', function (req, res) {
		//res.sendStatus(204);
		// idk do we need checks before these?
		if(req.session.client != undefined && req.session.client.search != undefined)
			res.json(req.session.client.search);
	});


	app.get('/display_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined && req.session.client.search != undefined) {
			res.sendFile('display_preferences.html', { root: signupDir + 'display/' });
		} else {
			res.redirect('/');
		}
	});

	app.get('/display_preferences.js', function (req, res) {
			res.sendFile('display_preferences.js', { root: signupDir + 'display/' });
	});

	app.get('/display_preferences.css', function (req, res) {
			res.sendFile('display_preferences.css', { root: signupDir + 'display/' });
	});

	app.get('/modify_display_preferences', function (req, res) {
		if(req.session.client != undefined && req.session.client.personal != undefined) {
			res.sendFile('display_preferences.html', { root: signupDir + 'display/' });
		} else {
			res.redirect('/');
		}
	});

	app.post('/get_display_preferences', function (req, res) {
		//res.sendStatus(204);
		if(req.session.client != undefined && req.session.client.search != undefined)
			res.json(req.session.client.display);
	});


	app.get('/data.json', function (req, res) {
		res.sendFile('data.json', { root: resourcesDir + 'json/' });
	});

	app.get('/favicon.ico', function(req, res) {
	    res.sendStatus(204);
	});

	// Anything not mapped to another handle at the root will be assumed to be an ID and thus will try to be served as a user
	app.get('/:id', function (req, res) {
		console.log("Serving user:", req.url);
		res.sendFile('index.html', { root: clientsDir + req.url.toLowerCase() });
	});
	
	// Serve the 404 file if the file is missing; this overrides the directive for users (/:id) that don't exist
	app.use(function (err, req, res, next) {
	  console.error(err.stack);
		res.sendFile('404.html', { root: templatesDir + '404/' });
	});

	app.listen(8080, function () {
	  console.log('Listening on port 8080!');
	});
}