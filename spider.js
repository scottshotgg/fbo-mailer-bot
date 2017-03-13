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
        return ("[" + (process.memoryUsage().rss  / 1000000).toFixed(2) + " MB]");
    },
    colors: {
        stamp:    "yellow",
        label:    "red",
        metadata: "green"
    }
} );

//var serverAddress = '10.201.40.178';
var serverAddress = 'arc-fbobot.utdallas.edu:8080';

//var emailList = ['scg104020', 'ajn160130', 'mjk052000', 'vaf140130'];
var emailList = ['scg104020'];
var send = true;

var columns       = ['Title', 'BAA', 'Agency', 'Date', 'Link'];
var attributeList = ['Title', 'BAA', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link'];

var columnIndexs = columns.map(function(column) {
  return attributeList.indexOf(column);
});


function sendEmail(body, length) {
  sendmail({
    from: 'FBO-Opportunities-Mailer',
    to: emailList.map(email => email + '@utdallas.edu'),
    subject: length + ' NEW FBO Opportunities Found - Updates for ' + getDateInfo().join('/'),
    html: body
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
  var downloadThisFile = 'FBO Database entries <br><a href="http://' + serverAddress + '/index" download>Download this file</a>';

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
      var csvString = rows.map(row => Object.values(row).join(', '));

      console.log(csvString);

      fs.writeFile("FBODatabase.csv", htmlHeading + downloadThisFile + tableHTMLString, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("FBODatabase.csv was saved!");
      });

    });
  });
}


function scrapeFBOData() {

  console.log('\n\n' + new Date() + '\n\n');


  var nightmare = new Nightmare();

  var data = nightmare
    .goto('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list')
    //.type('#search_form_input_homepage', 'github nightmare')
    //.click('#search_button_homepage')
    .evaluate(function() {
      document.getElementById('dnf_class_values_procurement_notice__classification_code___79_check').checked=true;
      document.getElementById('dnf_class_values_procurement_notice__naics_code___0220065_check').checked=true;
      document.getElementById('dnf_class_values_procurement_notice__procurement_type___k_check').checked=true;
      document.getElementsByName('dnf_opt_submit')[1].click();
    })
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

      var emailBody = "FBO updates for " + getDateInfo().join('/') + '<br>';

      var htmlHeading = `<!DOCTYPE html>
                            <html>
                            <head>
                            <style>
                              table, th, td {
                                  border: 1px solid black;
                                  border-collapse: collapse;
                              }
                              th, td {
                                  padding: 10px;
                              }
                            </style>
                            </head>
                            <body>`;


      var tableBeginning = `
                            <div style="padding: 2.5%"><table style="width:100%; font-size:18px; font-face:bold;">
                            <tr>`;

      var tableHeaders = columns.slice(0, columns.length - 1);

      for (header of tableHeaders) {
        tableBeginning += '\n<th><b>' + header + '</b></th>';
      }

      // Add a blank line between the column heading and the rest of the tuples
      tableBeginning +=    `\n</tr>
                            <tr style="height:22px;">
                            <td colspan="10"></td>
                            </tr>`;

      var tableRows =       "";


      var tableEnding =    `\n</table>
                            </div>
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

        var viewThisFile = '<a href="http://' + serverAddress + '/index.html" download>View and download this file</a>' + '<br><br>';
        var downloadThisFile = '<a href="http://' + serverAddress + '/index" download>Download this file</a>';  

        stmt.finalize(function() {
          //console.log(rows);

          if(send && tableLength > 0) {

            // Create new index and CSV files if there are updates available
            db.serialize(function() {
              createFiles(htmlHeading, tableBeginning, tableEnding);
            });

            // Send email and only include the rows that need to be updated
            sendEmail(htmlHeading + emailBody + viewThisFile + tableBeginning + rows.reverse().map(makeTableRowHTML).join('') + tableEnding, tableLength);
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

scrapeFBOData();



// var job = new CronJob({
//   cronTime: '00 00 8 * * 1-5',
//   onTick: scrapeFBOData,
//   start: true,
//   timeZone: 'America/Chicago',
// //  runOnInit: true
// });
