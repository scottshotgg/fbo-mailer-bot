/*
	This is a file I am trying to create where all the shared global variables can live; requires that are done in every file, paths that are used in every file, etc
*/

express = require('express');
fs = require('fs');
path = require('path');
cookieParser = require('cookie-parser');
bodyParser = require('body-parser');
session = require('express-session');
md5 = require("blueimp-md5");
async = require('async');
ftp = require('ftp-get');
cheerio = require('cheerio');
mkdirp = require('mkdirp');
async = require('async');
MongoClient = require('mongodb').MongoClient;
cheerio = require('cheerio');

date = new Date();

// Might be able to make an object out of this
siteDir = __dirname + '/../site/'
signupDir = siteDir + 'signup/';
loginDir = siteDir + 'login/';
resourcesDir = __dirname + '/../resources/';
templatesDir = resourcesDir + 'templates/';
jsDir = resourcesDir + 'js/';
cssDir = resourcesDir + 'css/';
fontsDir = resourcesDir + 'fonts/';
templatesDir = resourcesDir + 'templates/';
clientsDir = resourcesDir + 'clients/';
dataTablesDir = resourcesDir + 'DataTables-1.10.13/';
feedDir = resourcesDir + 'feed/';
logDir = resourcesDir  + 'logs/';
logFileDir = logDir + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '/';

consoleStamp = require('./log-consoleStamp');
scraper = require('./scraper');
dbm = require('./database-mongo');
cron = require('./scheduler-cron');
host = require('./host-express');
//el = require('./eventloop-eventEmitter2');





// exports.siteDir = siteDir;
// exports.signupDir = signupDir;
// exports.loginDir = loginDir;
// exports.resourcesDir = resourcesDir;
// exports.templatesDir = templatesDir;
// exports.clientsDir = clientsDir;
// exports.feedDir = feedDir;
// exports.logDir = logDir;
// exports.logFileDir = logFileDir;
