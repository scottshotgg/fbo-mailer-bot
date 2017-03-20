// ***** schedule this whole thing *****

// NightmareJS for the spider construction
var Nightmare = require('nightmare');       
//var nightmare = Nightmare({ show: true });

// SQLite3 for the database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fbo.db');

// SendMail for emailing the updates
var sendmail = require('sendmail')();

// For writing the HTML files
var fs = require('fs');

// MongoDB for the database
var MongoClient = require('mongodb').MongoClient;


// Using this to do the cron work since I don't want to mess with cron in Linux and this is more portable
//var CronJob = require('cron').CronJob;

// Set up the console stamp
    // Line number stuff
  Object.defineProperty(global, '__stack', {
    get: function(){
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack){ return stack; };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }
  });

  Object.defineProperty(global, '__line', {
    get: function(){
      return __stack[3].getLineNumber();
    }
  });

  Object.defineProperty(global, '__function', {
    get: function() {
        return __stack[3].getFunctionName();
    }
  });


require( "console-stamp" )( console, {

    metadata: function () {
        var funcout = __function;

        return ('[ RAM: ' + (process.memoryUsage().rss  / 1000000).toFixed(2) + ' MB | caller: ' + __function + ' | line: ' + __line + ' ]');
    },
    colors: {
        stamp:    "yellow",
        label:    "red",
        metadata: "green"
    }
} );


process.argv.forEach(function(arg, index) {
  console.log(index, arg);
})

//var serverAddress = '10.201.40.178';
var serverAddress = 'http://arc-fbobot.utdallas.edu:8080';

var templateFile = 'index.template';

process.argv[2] == 'server' ? templateFile = 'file:///home/fborobo/fbo-mailer-bot/' + templateFile : templateFile = 'file:///home/scottshotgg/Development/fbo-mailer-bot/' + templateFile;

console.log(templateFile);
 
var emails = ['scg104020@utdallas.edu'];
if (process.argv[6] != undefined && process.argv[6].length > 0) {
  emails.push(process.argv[6]);
  //console.log(emailList);
}

var specialMessageAddition = '';
if (process.argv[4].length > 0) {
  specialMessageAddition = '<div style="width: 700px;"><b><h3>Announcement:</h3></b>' + process.argv[4] + '</div><br><br><br>';
}

var forceEmailSend = parseInt(process.argv[5]) || 0;

var columns       = ['Title', 'BAA', 'Agency', 'Date', 'Link'];
var attributeList = ['Title', 'BAA', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link', 'File'];

var columnIndexs = columns.map(function(column) {
  return attributeList.indexOf(column);
});

var parentElements = [];
var parentElementsInnerText = [];

var lastMongoID = 0;


// Small client class
class Client {
  constructor(name, email, checkList) {
    this.Name = name;
    this.Email = email;
    this.SearchCriteria = checkList;
    // this should probably reference a root dir 
    (name == '') ? (this.Path = '') : (this.Path = 'clients/' + name + '/');
  }
}

// Store this stuff in a DB table
var clients = [''];
if (process.argv[3] == "deploy") {
   emails.push(['arc@lists.utdallas.edu']);
}
console.log(emails);

var checkList = [['A -- Research & Development', '541712 -- Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)', 'Combined Synopsis/Solicitation']];

// Make the clientMap using the stuff from the DB
var clientMap = clients.map(function(client, index) {
  return new Client(client, emails[index], checkList[index]);
});

function sendEmail(email, html, length) {
  sendmail({
    from: 'FBO-Mailer-Bot',
    //to: emailList.map(email => email + '@utdallas.edu'), 
    to: email,
    subject: length + ' NEW FBO Opportunities Found - ' + getDateInfo().join('/'),
    html: html
  },  
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
}


function createLink(link, text) {
  return '<a href="' + link + '">' + text + '</a>'
}


function makeTableRowHTML(row) {
  var returnString;

  if (!Array.isArray(row)) {
    var returnString = '<tr><td><center>' + createLink(row.Link, row.Title) + '</center></td>' + [row.BAA, row.Agency, row.Date].map(function(data) {
      return '<td><center>' + data + '</center></td>';
    }).join('') + '</tr>';

  } else {
    var returnString = '<tr><td><center>' + createLink(row[row.length - 1], row[0]) + '</center></td>' + columnIndexs.slice(1, columnIndexs.length - 1).map(function(index) {
      return '<td><center>' + row[index] + '</center></td>';
    }).join('') + '</tr>';
    console.log(returnString);
  }

  return returnString;
} 


function getDateInfo(date) {
  var d;
  if(date == undefined) {
    d = new Date();
  } else {
    d = new Date(date);
  }

  return [d.getMonth() + 1, d.getDate(), d.getFullYear()];
}


function getAttributes() {
  parentElements = [].slice.call(document.getElementsByClassName('input-checkbox'))
  parentElementsInnerText = parentElements.map(element => element.labels[0].innerText);
}


function checkAttribute(name) {
  // Try to change this to be subString
  parentElements[parentElementsInnerText.indexOf(name)].checked = true;
}


function pressSubmitButton() {
  document.getElementsByName('dnf_opt_submit')[1].click();
}


function createFile(filePath, html) {
  fs.writeFile(filePath, html, (err) => {
      if(err) {
      return console.log(err);
    }

    console.log('******' + filePath + 'was saved!');
  });
}


function makeDir(path) {
  console.log(path);
  console.log('path ' + path);
  if (!fs.existsSync(path)) {
      fs.mkdir(path, (err, folder) => {
      if (err) throw err;
        console.log("Created folder", folder);
    });
  }
}


function createCSVFile(path, rows) {
  //Write FBODatabase.csv file
  var csvString = rows.map(row => Object.values(row).map(value => '"' + value + '"').join(','));
  //console.log(csvString);

  fs.writeFile(path + "FBODatabase.csv", (['DB ID'].concat(attributeList).join(',')).toString() + '\n' + csvString.join('\n')), (err) => {
      if(err) {
        return console.log(err);
    }
    console.log(" ****** FBODatabase.csv was saved!");
  };
}


function injectHTML(template, rowsLength, client) {
  // Extract entire database
  mongo.collection('fbodata').find({}).sort({Date: -1, Title: 1}).toArray().then((results) => {

    //console.log(results);

    var rowValues = Object.values(results);
    createCSVFile(client.Path, rowValues);
    var completeRowsHTML = rowValues.map(makeTableRowHTML);

    var tableColumns = columns.slice(0, columns.length - 1);
    var tableHeader = tableColumns.slice(0, tableColumns.length - 1).map(header => '<th>' + header + '</th>').join('\n') + '\n<th style="min-width: 120px;">' + tableColumns[tableColumns.length - 1] + '</th>';
    var filePath = (client.Name == '' ? '' : 'clients/' + client.Name + '/');


     var nn = new Nightmare({show: false})
        .goto(template)
        .evaluate(function(template, completeRowsHTML, tableHeader, client, rowsLength) {
          var filePath = client.Path;

          // Inject index.html elements
          $('thead')[0].innerHTML = tableHeader;
          $('tbody')[0].innerHTML = completeRowsHTML.join('');
          $('#search_parameters')[0].innerHTML = client.SearchCriteria.map((ele, index) => (index + 1) + '. ' + ele).join('<br>');
          $('#date')[0].innerHTML = 'Generated on ' + (new Date());
          // might need to change some file stuff here
          $('#download')[0].href = 'http://arc-fbobot.utdallas.edu:8080/' + filePath + 'FBODatabase.csv';
          indexHTML = $('html')[0].outerHTML;

          // Inject email.html elements
          $('#download')[0].href = 'http://arc-fbobot.utdallas.edu:8080/' + filePath + 'index.html';
          $('#download')[0].innerText = 'View and Download the full database';
          $('tbody')[0].innerHTML = completeRowsHTML.splice(0, rowsLength).join('');
          emailHTML = $('html')[0].outerHTML;

          return {'Index': indexHTML, 'Email': emailHTML};
        }, template, completeRowsHTML, tableHeader, client, rowsLength)
        .end()
        .then(function(html) {
          createFile(filePath + 'index.html', html.Index);
          createFile(filePath + 'email.html', html.Email);
          sendEmail(client.Email, html.Email, rowsLength);
        });
    });
}


function scrapeFBOData(client) {
  console.log('\n\n' + new Date() + '\n\n');

  console.log("client:", client);
  
  // might be able to use another instance to alleviate the repetitive fetching of the checkboxes
  var night = new Nightmare({ show: false })
    .goto('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list')
    .evaluate(function(client) {
      parentElements = [].slice.call(document.getElementsByClassName('input-checkbox'))
      parentElementsInnerText = parentElements.map(element => element.labels[0].innerText);

      client.SearchCriteria.forEach(function(attr) {
        parentElements[parentElementsInnerText.indexOf(attr)].checked = true;
      });

      document.getElementsByName('dnf_opt_submit')[1].click();
    }, client)
    .wait('.list')
    .evaluate(function(attributeList) {
      return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
        function(row) {
          return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
            function(item, index) {
              return {[attributeList[index]]: item};
            }
          )));
          //return row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href);
        }
      )
    }, attributeList)
    .end()
    .then(function(data) {
      mongoDBEmitter.emit('insert', data.reverse(), client);
    });
}


/* ===================  THIS IS THE CODE YOU ARE LOOKING FOR  =================== */
/* ===================  THIS IS WHERE EVERYTHING STARTS       =================== */


var newRows = {};
var tableLength = 0;

var fbodataCollection;
var mongo;

const EventEmitter = require('events');
class DBEmitter extends EventEmitter {}
const mongoDBEmitter = new DBEmitter();

mongoDBEmitter.on('insert', (rows, client) => {

  /*
      let requests = [1,2,3].map((item) => {
          return new Promise((resolve) => {
            asyncFunction(item, resolve);
          });
      })

      Promise.all(requests).then(() => console.log('done'));
    */

  var rowPromises = rows.map((row, index) => {
    row.ID = index;
    return insertMongoDB(row);

    //return thing.then((value) => {
      //console.log('hi', value);
      //return value;
    //});  
  });

  console.log('rowPromises', rowPromises);


  Promise.all(rowPromises)
    .then(results => {
      injectHTML(templateFile, tableLength, client);
    });


  // rowPromises.then((value) => {
  //   console.log('rowPromises', value);
  // })

  /*Promise.resolve(rowPromises)
    .then((value) => { 
      console.log('\ndone', value);
    })
    .then((value) => {
      console.log('\ndonerino', value);
    })
    .catch((reason) => { 
      console.log('still gonna do this whole console.log thing...', reason);
    });*/
});

mongoDBEmitter.on('close', () => {
  console.log('closing...');

  mongo.close();
});


function connectMongoDB() {
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/fbo-mailer", function(err, mdb) {
    if(!err) {
      console.log('Connected');
      mongo = mdb;
      createCollection();
    } else {
      console.log(err);
    }
  });
}


function insertMongoDB(row) {
  return fbodataCollection.insert(row)
    .then(() => {
    //console.log('pushing one');
      //newRows[row.ID] = (row);
      //fbodataCollection.remove(row)
      tableLength++;
    })
    .catch((err) => {
      console.log(err);
    });
}

function createCollection() {
  console.log('We are connected');

  mongo.collection('counters').insert(
    { _id: "userid",
      seq: 0 }, 
      function(err, records) {
    }
  );

  fbodataCollection = mongo.collection('fbodata');
  fbodataCollection.createIndex({'BAA': 1}, {unique: true});

  /*
  lastID = getLastMongoID().then((thing) => {
    return thing;
  });
  */
  // Don't think I'll need to resolve the promise again unless the promise is actually to another promise ('is such a thing... even... possible ??? *le alien guy meme face*')
  lastID = getLastMongoID();

}

function getLastMongoID() {
  return fbodataCollection.find({}).sort({'ID': -1}).limit(1).next().then(function(value) {
    return value.ID;
  });
}


function getNextSequence(name, row) {
   var ret = mongo.collection('counters').findAndModify(
          { _id: name },
          undefined,
          { $inc: { seq: 1 } },
          function(err, object) {
            if(!err) {
              row.ID = object.value.seq;
              //console.log(row);
              fbodataCollection.insert(row);
            }
          }
   );
}


connectMongoDB();



// let clientPromises = clientMap.map((client) => {
//   if(client.Path != '') {
//     makeDir(client.Path);
//   }
  
//   // we really need to make a producer consumer thing
//   return new Promise((resolve) => {
//     scrapeFBOData(client)
//   }).then(() => {});
// });
// console.log('*************************wait for me************************');

// console.log(clientPromises);

// Promise.all(clientPromises)
//   .then(() => {
//     console.log('*************************closing************************');
//     mongoDBEmitter.close('close');
//   });


/*
let requests = clientMap.map((client) => {
    return new Promise((resolve, reject) => {
      scrapeFBOData(client)
    });
});

console.log(requests);

Promise.all(requests).then(() => console.log('done'));
*/
function asyncFunction (item, cb) {
  setTimeout(() => {
    console.log('done with', item);
    cb();
  }, 100);
}

console.log('clientMap', clientMap[0])

let requests = [1].map((item) => {
    return new Promise((resolve) => {
      asyncFunction(item, resolve);
      scrapeFBOData(clientMap[0])
    });
});


Promise.all(requests)
  .then(results => {
    //injectHTML(templateFile, tableLength, client);
    console.log(results);
  })
  .catch((err) => {
    console.log(err);
  });




