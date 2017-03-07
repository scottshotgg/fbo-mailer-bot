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
  //for(column of columns) {
  //  console.log(column, attributeList.indexOf(column)); 
  //}

  var newRow = new Array();
  var returnString = "";

  // for (value of array) {
  //   newRow.push(row[value]);
  // }


  var returnString = '<tr><td><center>' + createLink(row[row.length - 1], row[0]) + '</center></td>';

    for(index of columnIndexs.slice(1, columnIndexs.length - 1)) {
      returnString += '<td><center>' + row[index] + '</center></td>';
    }

  returnString += '</tr>';

  return returnString;




  //return '<tr><td><center>' + createLink(newRow[newRow.length - 1], newRow[0]) + '</center></td>' + '\n<td><center>' + newRow[1] + '</center></td><td><center>\n' + newRow[2] + '</center></td>\n' + '</tr>'
  //return '<tr><th><a href="' + newRow[newRow.length - 1] + '">' + newRow[0] + '</a>' + '</th>' + '\n<th>' + newRow.slice(1, newRow.length - 2).join('</th><th>\n') + '</tr>';
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

      console.log(data);

      // get the date with the function so its cleaner
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

                            <table style="width:100%; font-size:18px; font-face:bold;">
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


      var tableEnding =     `\n</table>
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
                rows.push(piece);
                tableLength += 1
                lastID = this.lastID;
              }
            });
        });


        var viewThisFile = '<a href="ftp://10.201.40.178/fboscraper/table.html" download>View and download this file</a>' + '<br><br>';
        var downloadThisFile = '<a href="ftp://anonymous@10.201.40.178/fboscraper/FBODatabase.csv" download>Download this file</a>' + '<br><br>';  

        stmt.finalize(function() {
          //console.log(rows);

          if(send && tableLength > 0) {

            var writeStream = fs.createWriteStream("FBODatabase.csv");
            writeStream.write(tableHeaders.join(',') + '\n');
            writeStream.on('finish', () => { writeStream.close(); });

            // use .reverse() on this
            for(row of rows.reverse()) {
              row[7] = getDateInfo(row[7]).join('/');
              writeStream.write([lastID--].concat(row.map(ele => '"' + ele + '"')).join(',') + '\n');

              tableRows += makeTableRowHTML(row);
            }
            writeStream.end();

            var tableHTMLString = tableBeginning + tableRows + tableEnding;

            fs.writeFile("table.html", htmlHeading + 'FBO Database entries <br>' + downloadThisFile + tableHTMLString, function(err) {
              if(err) {
                return console.log(err);
              }
              console.log("table.html was saved!");
            });
            
            sendEmail(htmlHeading + emailBody + viewThisFile + tableHTMLString, tableLength);
          } else {
            console.log("\n\nNothing new scraped, nothing new to see. :(");
          }
        });
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


/*
var job = new CronJob({
  cronTime: '00 30 16 * * 1-5',
  onTick: scrapeFBOData,
  start: true,
  timeZone: 'America/Chicago',
  runOnInit: true
});
*/