// ***** schedule this whole thing *****

// NightmareJS for the spider construction
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });

// SQLite3 for the database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fbo.db');

// SendMail for emailing the updates
var sendmail = require('sendmail')();

// For writing the HTML files
var fs = require('fs');

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

var i = 0;
process.argv.forEach(function(arg) {
  console.log(i++, arg);
})

//console.log(__filename.split('/').splice(-1, 1).push(templateFile).join('/'));
//return;


//var serverAddress = '10.201.40.178';
var serverAddress = 'http://arc-fbobot.utdallas.edu';

var templateFile = 'index.template';

process.argv[2] == 'server' ? templateFile = 'file:///home/fborobo/fbo-mailer-bot/' + templateFile : templateFile = 'file:///home/scottshotgg/Development/fbo-mailer-bot/' + templateFile;

console.log(templateFile);
 
if (process.argv[6] != undefined && process.argv[6].length > 0) {
  emailList.push(process.argv[6]);
  console.log(emailList);
}

var specialMessageAddition = '';
if (process.argv[4].length > 0) {
  specialMessageAddition = '<div style="width: 700px;"><b><h3>Announcement:</h3></b>' + process.argv[4] + '</div><br><br><br>';
}

var forceEmailSend = parseInt(process.argv[5]) || 0;
console.log(forceEmailSend)

var columns       = ['Title', 'Solicitation ID', 'Agency', 'Date', 'Link'];
var attributeList = ['Title', 'Solicitation ID', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link', 'File'];

var columnIndexs = columns.map(function(column) {
  return attributeList.indexOf(column);
});

var parentElements = [];
var parentElementsInnerText = [];

var searchCriteriaObj = {
  'Classification Code': 'A -- Research & Development',
  'Opportunity/Procurement Type': 'Combined Synopsis/Solicitation',
  'NAICS Code': '541712 -- Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)'
};

console.log('searchCriteriaObj values: ', Object.values(searchCriteriaObj));


// Small client class
class Client {
  constructor(name, email, searchCriteriaObj) {
    this.Name = name;
    this.Email = email;
    this.SearchCriteria = searchCriteriaObj;
    // this should probably reference a root dir 
    (name == '') ? (this.Path = '') : (this.Path = 'clients/' + name + '/');
  }
}

// Store this stuff in a DB table
var clients = [''];
var emails = ['scg104020@utdallas.edu'];
if (process.argv[3] == "deploy") {
   emails = ['arc@lists.utdallas.edu'];
}
console.log(emails);

var checkList = [['A -- Research & Development', '541712 -- Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)', 'Combined Synopsis/Solicitation']];

// Make the clientMap using the stuff from the DB
var clientMap = clients.map(function(client, index) {
  // searchCriteriaObject needs to be associated per person
  return new Client(client, emails[index], searchCriteriaObj);
});

function sendEmail(email, html, length) {
  sendmail({
    from: 'FBO-Mailer-Bot@utdallas.edu',
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
    var returnString = '<tr><td><center>' + createLink(row.Link, row.Title) + '</center></td>' + [row.SolicitationID, row.Agency, row.Date].map(function(data) {
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
  console.log(csvString);

  fs.writeFile(path + "FBODatabase.csv", (['DB ID'].concat(attributeList).join(',')).toString() + '\n' + csvString.join('\n')), (err) => {
      if(err) {
        console.log(err);
    }
    console.log(" ****** FBODatabase.csv was saved!");
  };
}


function injectHTML(template, rows, client) {
  db.serialize(function() {
    var rowsLength = rows.length;
    // Extract entire database
    db.all('select * from fbodata', function(err, rows) {
      createCSVFile(client.Path, rows); 

      var completeRowsHTML = rows.reverse().map(makeTableRowHTML);

      var tableColumns = columns.slice(0, columns.length - 1);
      var tableHeader = tableColumns.slice(0, tableColumns.length - 1).map(header => '<th>' + header + '</th>').join('\n') + '\n<th style="min-width: 120px;">' + tableColumns[tableColumns.length - 1] + '</th>';
      var filePath = (client.Name == '' ? '' : 'clients/' + client.Name + '/');

      var nn = new Nightmare()
        .goto(template)
        .evaluate(function(template, completeRowsHTML, tableHeader, client, rowsLength) {
          var filePath = client.Path;

          // Inject index.html elements
          $('thead')[0].innerHTML = tableHeader;
          $('tbody')[0].innerHTML = completeRowsHTML.join('');
          //$('#search_parameters')[0].innerHTML = Object.values(client.SearchCriteria).map((ele, index) => (index + 1) + '. ' + ele).join('<br>');
          $('#search_parameters')[0].innerHTML = Object.keys(client.SearchCriteria).map((ele) => '<b>' + ele + ' :</b> ' + client.SearchCriteria[ele]).join('<br>');
          $('#date')[0].innerHTML = 'Generated on ' + (new Date());
          // might need to change some file stuff here
          $('#download')[0].href = 'http://arc-fbobot.utdallas.edu/' + filePath + 'FBODatabase.csv';
          indexHTML = $('html')[0].outerHTML;

          // Inject email.html elements
          $('#download')[0].href = 'http://arc-fbobot.utdallas.edu/' + filePath + 'index.html';
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
        })
        .catch((whattosay) => {
          console.log('is the wtf you want', whattosay);
        }); 
    });
  });
}


function scrapeFBOData(client) {
  console.log('\n\n' + new Date() + '\n\n');

  console.log("client:", client);
  
  // might be able to use another instance to alleviate the repetitive fetching of the checkboxes
  var nightmare = new Nightmare({ show: true })
    .goto('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list')
    .evaluate(function(client) {
      parentElements = Object.assign(...[].slice.call(document.getElementsByClassName('input-checkbox')).map(element => {
        return {[element.labels[0].innerText]: element};
      }));

      Object.values(client.SearchCriteria).forEach(function(attr) {
        parentElements[attr].checked = true;
      });

      document.getElementsByName('dnf_opt_submit')[1].click();
    }, client)
    .wait('.list')
    .evaluate(function(attributeList) {
      return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
        function(row) {
          /*return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
            function(item, index) {
              return {[attributeList[index]]: item};
            }
          )));*/
          return row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href);
        }
      )
    }, attributeList)
    .end()
    .then(function(data) {
      console.log(data);
      var stmt = db.prepare("insert into fbodata (Title, SolicitationID, Classification, Agency, Office, Location, Type, Date, Link) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");

      var tableLength = 0;
      var rows = new Array();
      var lastID = 1;

      db.serialize(function() {
        //data.map(function(item, index, htmlString) {
          data.reverse().map(function(piece) {
          //for (var piece of data) {
            console.log(Object.keys(piece));
            stmt.run(piece, function(error) {
              //console.log("htmlString: ", htmlString);
              console.log("stmt.run error:", error);

              if(error == null) {
                //console.log(rows);
                rows.push(piece);
                tableLength += 1
                //lastID = this.lastID;
              }
            });
        });

        stmt.finalize(function() {
          if(tableLength > 0 || forceEmailSend == 1) {
            injectHTML(templateFile, rows, client);
          } else {
            console.log("\n\nNothing new scraped, nothing new to see. :(");
          }
        });

        db.close();
      })
    })
    .catch(function (error) {
      console.error('Search failed:', error);
    });
}


/* ===================  THIS IS THE CODE YOU ARE LOOKING FOR  =================== */
/* ===================  THIS IS WHERE EVERYTHING STARTS       =================== */

db.serialize(function() {
  db.run("create table fbodata (ID integer primary key, Title text not null, SolicitationID text not null unique, Classification text, Agency text, Office text, Location text, Type text, Date text, Link text, File string)", function(error) {
       console.log("Table Creation Error:", error);
   });
});

makeDir('clients/complete');

clientMap.forEach(function(client) {
  if(client.Path != '') {
    makeDir(client.Path);
  }
  
  // we really need to make a producer consumer thing
  scrapeFBOData(client);
});