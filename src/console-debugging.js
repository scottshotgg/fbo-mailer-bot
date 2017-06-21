// console debugging
var fs = require('fs');

var logdir = __dirname + '/logs'
console.log(logdir)
if(!fs.existsSync(logdir)) {
	fs.mkdirSync(logdir);
}

// Using console stamp to provide better print outs for debugging
var cs = require("console-stamp") (console, {
	metadata: function () {
		var funcout = __function;


		var printout = ('[ RAM: ' + (process.memoryUsage().rss  / 1000000).toFixed(2) + ' MB | caller: ' + __function + ' | line: ' + __line + ' ]');
		//console.log(console);
		fs.appendFileSync(logdir + '/logfile', printout + '\n', 'utf8');

		return printout;
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