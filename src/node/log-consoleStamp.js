/*
	This file is used to provide console/log debugging for the scraper
*/
const { Console } = require('console');
const leftpad = require('left-pad');

// /console.log(logFileDir);
var logFile = date + '.log';

// probably should have a try catch here just in case
(() => {
	if(!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir);
		fs.mkdirSync(logFileDir);
	} else if(!fs.existsSync(logFileDir)) {
		fs.mkdirSync(logFileDir);
	}
})();

const logFileOutputStream = fs.createWriteStream(logFileDir + logFile);

// Define new consoles
const logger = new Console(logFileOutputStream, null);
const stamp = new Console(process.stdout, process.stderr);

// Using this to avoid drawing off the top of the stack when recursing through in the printout
var globalStackDrawValue = 3;

// Set up the console stamp
// Define the V8 global stack trace property
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

// Get the file that 'console.log(...)' it was called in
Object.defineProperty(global, '__file', {
  get: function() { 
  	return __stack[globalStackDrawValue].getFileName().split('/').slice(-1)[0];
  }
});

// Get the function that 'console.log(...)' it was called in
Object.defineProperty(global, '__function', { 
	get: function() { 
		return __stack[globalStackDrawValue].getFunctionName();
	}
});

// Get the line that called the 'console.log(...)'
Object.defineProperty(global, '__line', {
	get: function() { 
		return __stack[globalStackDrawValue].getLineNumber(); 
	}
});

// Remap console.log to print to both of our defined consoles; the log file and stdout
console.log = (...args) => {
	logger.log(...args, '\n');
 	stamp.log(...args, '\n');
}


// function makeOutputString(inputVars) {
// 	var outputString = ;


// 	return outputString;
// }


// Using console stamp to provide better print outs for debugging
var cs = require("console-stamp") (console, {
	metadata: function () {
		// format this better
		var printout = ('[ RAM: ' + leftpad((process.memoryUsage().rss  / 1000000).toFixed(2), 6, ' ') + ' MB | file: ' + leftpad(__file, 19, ' ') + ' | line: ' + leftpad(__line, 3, ' ') + ' | caller: ' + __function + ' ]');
		logger.log(printout);
		return printout + '\n';
	},
	colors: {
		stamp:    "yellow", 
		label:    "red",
		metadata: "green"
	}
});