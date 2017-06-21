var fs = require('fs');
var mkdirp = require('mkdirp');
var hostexpress = require('./host-express');
var databasemongo = require('./database-mongo');
var schedulercron = require('./scheduler-cron');
var consoledebugging = require('./console-debugging');


// Do this for now
var scraper = require('./scraper');


/*

		***** NEED TO SET UP THE EVENT LOOP *****
				  MAKE THE PROGRAM GOOD
*/
 

/*&try {
	fs.openSync(__dirname + '/logs/logfile', 'w');
} catch(err) {
	console.log('Creating log folder');
	fs.mkdirSync(__dirname + 'logs');
	fd = fs.openSync(__dirname + '/logs/logfile', 'w');
}*/

// Using request to GET the page from yesterday 
var request = require('request');

// SendMail for emailing the updates
var sendmail = require('sendmail')();

// This needs to be reformated for the current architecture
function sendEmail(email, html, length) {
  sendmail({
    from: 'FBO-Mailer-Bot@utdallas.edu',
    to: email,
    subject: length + ' NEW FBO Opportunities Found - ' + getDateInfo().join('/'),
    text: '',
    html: html
  },  
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
}



// Using the event-loop for the software architecture
//const EventEmitter = require('events');
//class EventLoop extends EventEmitter {}
//const mainEventLoop = new EventLoop();

//mainEventLoop.on('newClient', newClient());


var randomstring = require("randomstring");



/* Code (below) used to make this object was written by me (github.com/scottshotgg) and used on this page: https://www.fbo.gov/index?s=opportunity&tab=search&mode=list
*/
;
/* Code:
	JSON.stringify(Object.assign(...[].slice.call(document.getElementsByClassName('scrollable_checkbox')).slice(1).map((item) => {
		return {[item.parentElement.parentElement.parentElement.children[0].innerText.split('.')[0]]: 	Object.assign(...[].slice.call(item.children).map((checkbox) => {
			var split = checkbox.innerText.split(' -- ');
			return {[split[0]]: split[1]};
		}))};
	})));
*/
// See the file for the reason that this object is not directly in here.
var codeMapping = JSON.parse(fs.readFileSync(__dirname + '/codeMapping', 'utf8'));




/* The code (below) used to make this was written by me (github.com/scottshotgg) and used on https://github.com/chriskottom/fbo:
*/
/* Code:
JSON.stringify(Object.assign(...[].slice.call(document.getElementsByTagName('li')).slice(17, 31).map((item, index) => {
	var split = item.innerText.split(' (');
	return {[split[1].replace(')', '')]: split[0]};
})));
*/



//console.log(thing.match(/(<[A-Z]+>[A-Z]*[a-z]*[0-9]*[' ']*)+/g));
// thing.split(/(<[A-Z]+>.*)/g).map((item, index) => {
// 	if(item != '\n' && item != '')
// 		console.log(index, item);
// });

//console.log(thing.split(/(<[A-Z]+>.*)/g));
// var array = [];
// thing.split(/(<[A-Z]+>)/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);

// for(var i = 1; i < array.length; i+=2)
// 	console.log(array[i], array[i+1])

// var array = [];
// thing.split(/(<[A-Z]>)+/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);