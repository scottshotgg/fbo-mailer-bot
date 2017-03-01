// ***** schedule this whole thing


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

//var emailList = ['scg104020', 'ajn160130', 'mjk052000'];
var emailList = ['scg104020'];
var send = true;
var d = new Date();

function sendEmail(string, length) {
  sendmail({
    from: 'FBO-Opportunities-Mailer',
    to: emailList.map(email => email + '@utdallas.edu'),
    subject: length + ' New Opportunities Found - ' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear(),
    html: string
  },  
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
}


function makeTableRowHTML(row) {

  var array = [0, 1, 3, 8];
  var newRow = new Array();
  var returnString = "";

  for (value of array) {
    console.log(row[value]);
    newRow.push(row[value]);
  }

  return '<tr><th><a href="' + newRow[newRow.length - 1] + '">' + newRow[0] + '</a>' + '</th>' + '\n<th>' + newRow[1] + '</th><th>\n' + newRow[2] + '</th>\n' + '</tr>'
  //return '<tr><th><a href="' + newRow[newRow.length - 1] + '">' + newRow[0] + '</a>' + '</th>' + '\n<th>' + newRow.slice(1, newRow.length - 2).join('</th><th>\n') + '</tr>';
}


function getDateInfo(date) {
  var d = new Date(date);
  console.log("date", d.getDate());
  console.log("month", d.getMonth() + 1);
  console.log("year", d.getFullYear());
}

db.serialize(function() {
  db.run("create table fbodata (ID integer primary key, Title text not null, BAA text not null unique, Classification text, Agency text, Office text, Location text, Type text, Date text, Link text, File string)", function(error) {
       console.log("Table Creation Error:", error);
   });
});


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
  .evaluate(function() {
    // Try returning Object.keys(db or stmt) and see what we get
    var attributeList = ["Title", "BAA", "Classification", "Agency", "Office", "Location", "Type", "Date", "Link", "File"];

    return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
      function(row) {
        // return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
        //   function(item, index) {
        //   //console.log({[informationMap[index]]: item});
        //     return {[attributeList[index]]: item};
        //   }
        // )));
        return row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href);
      }
    )
  })
  .end()
  .then(function(data) {
    var stmt = db.prepare("insert into fbodata (Title, BAA, Classification, Agency, Office, Location, Type, Date, Link) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    var d = new Date();

    var emailBody = "FBO updates for " + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + "</br></br>";

    var tableBeginning = `<!DOCTYPE html>
                          <html>
                          <head>
                          <style>
                          table, th, td {
                              border: 1px solid black;
                              border-collapse: collapse;
                          }
                          </style>
                          </head>
                          <body>

                          <table style="width:100%; font-size:18px;">
                          <tr>`;

    var columns = ['Title', 'BAA', 'Agency'];

    for (column of columns) {
      tableBeginning += '\n<th>' + column + '</th>';
    }

    // Add a blank line between the column heading and the rest of the tuples
    tableBeginning +=    `\n</tr>
                          <tr style="height:22px;">
                          <th colspan="10"></th>
                          </tr>`;

    var tableRows =       "";


    var tableEnding =     `\n</table>
                           </body>
                           </html>`;

    var tableLength = 0;

    db.serialize(function(htmlString) {
      //data.map(function(item, index, htmlString) {

        data.map(function(piece) {
        //for (var piece of data) {
          stmt.run(piece, function(error) {
          //console.log("htmlString: ", htmlString);
          console.log("stmt.run error:", error);
          //console.log(data[this.lastID - 1]);
          if(error == null) {
            //return item[0] + "<br><a href=\"" + item[8] + "\">" + item[8] + "</a><br><br><br>";
            //console.log(item[0] + "\n<a href=\"" + item[8] + "\">" + item[8] + "</a>\n\n\n");
            //htmlString += piece[0] + "\n<a href=\"" + piece[8] + "\">" + piece[8] + "</a>\n\n\n";
            //console.log(piece);
            tableRow = makeTableRowHTML(piece);
            //console.log(tableRow, "\n\n\n");
            tableRows += tableRow;
            tableLength += 1;
            //htmlString += piece[0] + "\n<a href=\"" + piece[8] + "\">" + piece[8] + "</a>\n\n\n";
            //return item[0] + "\n<a href=\"" + item[8] + "\">" + item[8] + "</a>\n\n\n";
          }
        });
      });
      stmt.finalize(function() {
        var tableHTMLString = tableBeginning + tableRows + tableEnding;

        fs.writeFile("test.html", tableHTMLString, function(err) {
          if(err) {
            return console.log(err);
          }
          console.log("The file was saved!");
          //console.log(data);
        }); 

        if(send)
          sendEmail(emailBody + tableHTMLString, tableLength);
      });
    })
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  }); 