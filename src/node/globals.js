/*
	This file is where all the shared global variables live; requires that are done in every file, paths that are used in every file, etc
*/

fs = require('fs');
path = require('path');
EventEmitter = require('events');
express = require('express');
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
cron = require('node-cron');

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
scraper = require('./scraping-utils');
dbm = require('./database-mongo');
scheduler = require('./scheduler-cron');
host = require('./host-express');
el = require('./eventloop-events');
