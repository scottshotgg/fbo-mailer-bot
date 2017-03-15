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
require( "console-stamp" )( console, {
    metadata: function () {
        return ("[" + (process.memoryUsage().rss  / 1000000).toFixed(2) + " MB] " + (new Error).lineNumber);
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

//var serverAddress = '10.201.40.178';
var serverAddress = 'http://arc-fbobot.utdallas.edu:8080';

var emailList = ['scg104020'];
if (process.argv[2] == "deploy") {
   emailList.concat(['ajn160130', 'mjk052000', 'vaf140130']);
}
 
if (process.argv[5] != undefined && process.argv[5].length > 0) {
  emailList.push(process.argv[5]);
  console.log(emailList);
}

var specialMessageAddition = '';
if (process.argv[3].length > 0) {
  specialMessageAddition = '<div style="width: 700px;"><b><h3>Announcement:</h3></b>' + process.argv[3] + '</div><br><br><br>';
}

var forceEmailSend = parseInt(process.argv[4]) || 0;

var columns       = ['Title', 'BAA', 'Agency', 'Date', 'Link'];
var attributeList = ['Title', 'BAA', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link', 'File'];

var columnIndexs = columns.map(function(column) {
  return attributeList.indexOf(column);
});

var parentElements = [];
var parentElementsInnerText = [];



// Small client class
class Client {
  constructor(name, checkList) {
    this.Name = name;
    this.SearchCriteria = checkList; 
  }
}

// Store this stuff in a DB table
var people = ['jensen'];
var checkList = [['A -- Research & Development', '541712 -- Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)', 'Combined Synopsis/Solicitation']];

// Make the clientMap using the stuff from the DB
var clientMap = people.map(function(person, index) {
  return new Client(person, checkList[index]);
});

function sendEmail(heading, body, length) {
  sendmail({
    from: 'FBO-Mailer-Bot',
    to: emailList.map(email => email + '@utdallas.edu'), 
    subject: length + ' NEW FBO Opportunities Found - ' + getDateInfo().join('/'),
    html: heading + specialMessageAddition + body
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
    var returnString = '<tr><td><center>' + createLink(row.Link, row.Title) + '</center></td>' + [row.Agency, row.BAA, row.Date].map(function(data) {
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


function createFiles(htmlHeading, tableBeginning, tableEnding) {
  var downloadThisFile = '<center><h1>FBO Database entries</h1><br><a href="' + serverAddress + '/FBODatabase.csv" download>Download this file</a><center>';

  db.serialize(function() {
    // Extract entire database
    db.all('select * from fbodata', function(err, rows) {

      // Latest entries up
      rows.reverse();

      // Write index.html file
      var tableHTMLString = tableBeginning + rows.slice(0, 41).map(makeTableRowHTML).join('') + tableEnding;

      fs.writeFile("index.html", htmlHeading + downloadThisFile + tableHTMLString, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("index.html was saved!");
      });


      //Write FBODatabase.csv file
      var csvString = rows.map(row => '\n' + Object.values(row).map(value => '"' + value + '"').join(','));
      console.log(csvString);

      fs.writeFile("FBODatabase.csv", ([':ID'].concat(attributeList).join(',')).toString() + ',' + csvString), function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("FBODatabase.csv was saved!");
      };

    });
  });
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


function scrapeFBOData(client) {
  console.log('\n\n' + new Date() + '\n\n');

    console.log("clientMap:", clientMap);
  nightmare
    .goto('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list')
    //.type('#search_form_input_homepage', 'github nightmare')
    //.click('#search_button_homepage')

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
      // Try returning Object.keys(db or stmt) and see what we get
      //var attributeList = ['Title', 'BAA', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link'];

      return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
        function(row) {
          // return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
          //   function(item, index) {
          //     return {[attributeList[index]]: item};
          //   }
          // )));
          return row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href);
        }
      )
    }, attributeList)
    .end()
    .then(function(data) {
      var stmt = db.prepare("insert into fbodata (Title, BAA, Classification, Agency, Office, Location, Type, Date, Link) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");


      var htmlHeading = `<!DOCTYPE html>
                            <html>
                            <head>
                            <style>

                              table, th, td {
                                  border: 1px solid black;
                                  border-collapse: collapse;
                              }

                              th, td {
                                  padding: 15px;
                              }

                              th {
                                font-size: 22px;
                              }

                              td {
                                font-size:18px;
                              }

                              td:last-child {
                                width: 120px;
                              }

                            </style>
                            </head>
                            <body>`;

      var htmlEmailHeading = `<!DOCTYPE html>
                            <html>
                            <head>
                            <style>

                              table, th, td {
                                  border: 1px solid black;
                                  border-collapse: collapse;
                              }

                              th, td {
                                  padding: 15px;
                              }

                              th {
                                font-size: 20px;
                              }

                              td {
                                font-size:15px;
                              }

                              td:last-child {
                                width: 120px;
                              }

                            </style>
                            </head>
                            <body>`;


      var emailBody = '<center><h1>FBO Database entries</h1><br></center>';

      var tableBeginning = `
                            <center><div style=""><table style="min-width: 1000px; max-width: 1200px; width: 65%; font-face: bold;">
                            <tr><br><br>`;

      var tableHeaders = columns.slice(0, columns.length - 1);

      //for (header of tableHeaders) {
      //  tableBeginning += '\n<th><b>' + header + '</b></th>';
      //}

      tableBeginning += tableHeaders.slice(0, tableHeaders.length - 1).map(header => '<th><b>' + header + '</b></th>').join('\n') + '\n<th style="min-width: 120px;"><b>' + tableHeaders[tableHeaders.length - 1] + '</b></th>';

      console.log(tableBeginning);

      // Add a blank line between the column heading and the rest of the tuples
      tableBeginning +=    `\n</tr>
                            <tr style="height:22px;">
                            <td colspan="10"></td>
                            </tr>`;

      var tableRows =       "";


      var tableEnding =    `\n</table>
                            <br>
                            <br>
                            <br>
                            <br>
                            <div align="left" style="padding-left: 35%" id="search_parameters">The above was generated using the following search criteria: <br><br>` + client.SearchCriteria.map(function(element, index) { return '<div align="left">' + ++index + ". " + element + '</div>'}).join('') + `</div>
                            <br>
                            <br>
                            </div>
                            </center>
                            </body>
                            </html>`;

      var tableLength = 0;

      // fill this in
      var oldCSVName = "";

      var rows = new Array();
      var lastID = 1;

      db.serialize(function() {
        //data.map(function(item, index, htmlString) {
          data.reverse().map(function(piece) {
          //for (var piece of data) {
            stmt.run(piece, function(error) {
              //console.log("htmlString: ", htmlString);
              console.log("stmt.run error:", error);
              //console.log(data[this.lastID - 1]);
              if(error == null) {
                //console.log(rows);
                rows.push(piece);
                tableLength += 1
                lastID = this.lastID;
              }
            });
        });

        //var viewThisFile = '<a href="http://' + serverAddress + '">View and download this file</a>' + '<br><br>';
        var viewThisFile = '<center>' + createLink(serverAddress, 'View and download full database') + '</center><br><br>'

        stmt.finalize(function() {
          //console.log(rows);

          if(tableLength > 0 || forceEmailSend == 1) {

            // Create new index and CSV files if there are updates available
            db.serialize(function() {
              createFiles(htmlHeading, tableBeginning, tableEnding);
            });

            // Send email and only include the rows that need to be updated
            sendEmail(htmlHeading, emailBody + viewThisFile + tableBeginning + rows.reverse().map(makeTableRowHTML).join('') + tableEnding, tableLength);
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
  db.run("create table fbodata (ID integer primary key, Title text not null, BAA text not null unique, Classification text, Agency text, Office text, Location text, Type text, Date text, Link text, File string)", function(error) {
       console.log("Table Creation Error:", error);
   });
});


clientMap.forEach(function(client) {
  scrapeFBOData(client);
});



// var job = new CronJob({
//   cronTime: '00 00 8 * * 1-5',
//   onTick: scrapeFBOData,
//   start: true,
//   timeZone: 'America/Chicago',
// //  runOnInit: true
// });
