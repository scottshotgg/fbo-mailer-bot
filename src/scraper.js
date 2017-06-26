var fs = require('fs');
var ftp = require('ftp-get');
var el = require('./eventloop-events');
var cheerio = require('cheerio');
var mkdirp = require('mkdirp');


exports.fetchFeed = function(date = new Date()) {
	// change the pathdir stuff
	// put the new Date somewhere else so it is implicit
	//var filename = makeFilenameFromDate(new Date(date));
	var filename = makeFilenameFromDate(date);

	fs.open(__dirname + '/resources/feed/' + filename, 'r', (err, fd) => {
		if (err) {
			if (err.code === 'ENOENT') {
				console.error(filename, 'does not exist, fetching file...');
				ftp.get('ftp://ftp.fbo.gov/' + filename, __dirname + '/resources/feed/' + filename, function (err, res) {
					console.log(err, res); 
					el.emitAsync('parse', { feed: filename });
					//el.emit('finished', this);
					//databasemongo.connectMongoDB(fs.readFileSync(__dirname + '/resources/feed/' + filename, 'utf8'));
				});
			}
		} else {
			console.log(filename, 'already downloaded');
			el.emitAsync('parse', { feed: filename });
		}
		//el.emit('finished', 'insert');
	});
}

// FIX THIS AND REARCH IT
// ====== db stuff

exports.parseFeed = function(packet) {
	var filedata = fs.readFileSync(__dirname + '/resources/feed/' + packet.feed).toString();
	console.log('Parsing', packet.feed);

  	console.log('Inserting records...');
	filedata.split(/(<\/[A-Z]+>)/g).filter((item) => { return item.length > 15 }).map((item) => {
		if(!item.slice(4, 11).includes('ARCH')) { // filter out UNARCHIVE and ARCHIVE
			// Uncomment this when we are ready to insert again
			// >>>>>>>> enforce not null here <<<<<<<
			var datum = postProcessing(splitString(item));

			// just set the ID here maybe from the mapping stuff?
			if(datum.ID) {
				el.emit('insertdata', { data: datum });
			}
			//postProcessing(splitString(item))
			//console.log(postProcessing(splitString(item)));
		}
	});
	el.emit('finished', 'insert');
    //el.emit('finished', { data: 'fkukid' });
}


exports.generateNewClientPage = function(packet) {

	var client = packet.client; 
	var documents = packet.data;

  console.log(client.personal.netid + ' has ' + documents.length + ' entries');

  //console.log(fs.readFileSync('index.template', 'utf8'));
  // need to check if the client already has a file in the clients folder and if so append to that index, if they dont then make one for them
  var $ = cheerio.load(fs.readFileSync(__dirname + '/resources/templates/index.template.html', 'utf8'));

  // Need to tell the user when something doesn't exist
  // Change this to make it display what the user wants
  var tableColumns = ['Subject', 'ID', 'Opportunity/Procurement Type', 'Agency', 'Date', 'NAICS Code'];

  $('thead').html(tableColumns.slice(0, tableColumns.length).map(header => '<th>' + header + '</th>').join('\n'));
  $('tbody').html(documents.map((document) => {
    //return '<tr><td><center>' + document.Type + '</center></td>' + '<td><center>' + document.ID + '</center></td>' + '<td><center>' + document.Data.Subject + '</center></td>' + '<td><center>' + document.Data.Agency + '</center></td>';

    // Might need to make the link specification more generic
    return '<tr><td>' + makeLink(document[tableColumns[0]], document.URL).concat(tableColumns.slice(1).map((column) => {
       if(column.includes('.')) {
        //console.log(column);
        column = column.split('.');
        // make this recursive
        // make this detect if things are not available and put a '-'
        if(document[column[0]])
          return document[column[0]][column[1]];
        else
          return '-'
      //  return '0101010';
       } else {
        if(document[column]) {
          //console.log(column);
          //if(column.toLowerCase().includes('date')) {
          if(typeof document[column] == 'object') {
            //console.log(document.column)
            // Change this to specify the date format and join it like that
            // later though
            return Object.values(document[column]).join('/');
          } else {
            return document[column];
          }
        } else {
          if(typeof document[column] == 'object') {
            //console.log(document.column)
            // Change this to specify the date format and join it like that
            // later though
            return Object.values(document[column]).join(' -- ');
          } else {
            return document[column];
          }
        }
      }
    })).join('</td><td>') + '</td></tr>';


  }).join('\n'));

  $('#search_parameters').html(Object.keys({}).map((para) => {
    return '<b>' + para.split('.').slice(-1) + ' :</b> ' + client.Parameters[para];
  }));
  //console.log(client.Name + 'index.html')
  console.log('Attempting to write client index file: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
  try {
    fs.writeFileSync(__dirname + '/clients/' + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
    console.log('Client index file successfully written: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
  } catch(err) {
		console.log('Attempting to create client folder: /clients/' + client.personal.netid.toLowerCase());
		mkdirp(__dirname + '/clients/' + client.personal.netid.toLowerCase(), (err) => {
			if (!err) {
				console.log('Client folder successfully created: /clients/' + client.personal.netid.toLowerCase());
				try {

					fs.writeFileSync(__dirname + '/clients/' + client.personal.netid.toLowerCase() + '/index.html', $.html(), 'utf8');
    				console.log('Client index file successfully written: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
				} catch(err) {
					console.log('Error writing client index file: /clients/' + client.personal.netid.toLowerCase() + '/index.html');
				}
			} else {
				console.log('Error creating client folder: /clients', + client.personal.netid.toLowerCase());
			}
		});
	}

}

function makeFilenameFromDate(date) {
	return 'FBOFeed' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + (date.getDate() - 1)).slice(-2);
}

function postProcessing(oppo) {
  if(oppo.Date) {
    oppo.Date = oppo.Date.substring(0, 2) + '/' + oppo.Date.substring(2) + '/' + oppo.Year;
  }

  delete oppo.Year;

  if(oppo['Response Date']) {
    oppo['Response Date'] = oppo['Response Date'].substring(0, 2) + '/' + oppo['Response Date'].substring(2) + '/' + oppo.Year;
  }

  if(oppo['Archive Date']) {
   
    oppo['Archive Date'] = oppo['Archive Date'].substring(0, 2) + '/' + oppo['Archive Date'].substring(2) + '/' + oppo.Year;
  }

  if(oppo['Award Date']) {
    oppo['Award Date'] = oppo['Award Date'].substring(0, 2) + '/' + oppo['Award Date'].substring(2) + '/' + oppo.Year;
  }  

  oppo.ID = oppo['Solicitation Number'] || oppo['Award Number'];

  return oppo;
}

var typeMapping = {
  "PRESOL"  : "Presolicitation",
  "COMBINE"   : "Combined Synopsis/Solicitation",
  "AMDCSS"  : "Amendment to a Previous Combined Solicitation",
  "MOD"     : "Modification to a Previous Base",
  "AWARD"   : "Award",
  "JA"    : "Justification and Approval",
  "ITB"     : "Intent to Bundle Requirements",
  "FAIROPP"   : "Fair Opportunity / Limited Sources Justification",
  "SRCSGT"  : "Sources Sought",
  "FSTD"    : "Foreign Government Standard",
  "SNOTE"   : "Special Notice",
  "SSALE"   : "Sale of Surplus Property",
};

// Only explicitly list the stuff that will change, otherwise just slice the end and do a toLowerCase
var propMapping = {
  'CLASSCOD': 'Classification Code',
  'OFFADD'  : 'Office Address', // I think this is right??
  'RESPDATE': 'Response Date',
  'SOLNBR'  : 'Solicitation Number',
  'AWDNBR'  : 'Award Number',
  'AWDAMT'  : 'Award Amount',
  'AWDDATE' : 'Award Date',
  'DESC'    : 'Description',
  'LINENBR' : 'Line Number',
  'NTYPE'   : 'Notice Type',
  'MODNBR'  : 'Modification Number',
  'ARCHDATE': 'Archive Date',
  'SETASIDE': 'Set Aside',
  'NAICS'   : 'NAICS Code',
  'URL'     : 'URL',
  //'POPZIP'  : 'Place of Performance.Zip'
};


function makeLink(column, URL) {
	return ['<a href="' + URL + '">' + column + '</a>']
}

function splitString(thing) {
  var array = thing.split(/(<[A-Z]+>)/g);

  var object = {};
  object['Opportunity/Procurement Type'] = typeMapping[array[1].slice(1, -1)];

  for(var i = 3; i < array.length; i+=2)
  {
    var keyRaw = array[i].trim().slice(1,-1);
    var key = propMapping[keyRaw] || keyRaw[0] + keyRaw.substring(1).toLowerCase();
    var value = array[i+1].trim();

    // Test if the text has HTML in it, if so we want to strip it out because we only value the text
    if(/<[a-z][\s\S]*>/i.test(value))
      value = cheerio.load(value).text().trim();

    // If the object does not already contain the key
    if(object[key] == undefined) {
      object[key] = value;
    } else if(value != 'Link To Document') {
      object[key] = [object[key]].concat(value)
    }
  }

  return object;
}
