/*
	This is a file I am trying to create where all the shared global variables can live; requires that are done in every file, paths that are used in every file, etc
*/

var consoleStamp = require('./log-consoleStamp');
var scraper = require('./scraper');
var dbm = require('./database-mongo');
var cron = require('./scheduler-cron');
var host = require('./host-express');
var el = require('./eventloop-eventEmitter2');

var date = new Date();

// Might be able to make an object out of this
var siteDir = __dirname + '/../site/'
var signupDir = siteDir + 'signup/';
var loginDir = siteDir + 'login/';
var resourcesDir = __dirname + '/../resources/';
var templatesDir = resourcesDir + 'templates/';
var clientsDir = resourcesDir + 'clients/';
var feedDir = resourcesDir + 'feed/';
var logDir = resourcesDir  + 'logs/';
var logFileDir = logDir + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '/';
