// ***** schedule this whole thing


// NightmareJS for the spider construction
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });

// SQLite3 for the database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fbo.db');

// SendMail for emailing the updates
var sendmail = require('sendmail')();


function getDateInfo(date) {
  var d = new Date(date);
  console.log("date", d.getDate());
  console.log("month", d.getMonth() + 1);
  console.log("year", d.getFullYear());
}

db.serialize(function() {
  // db.run("create table fbodata (opportunity text not null unique, location text, type text, date text)", null, function(error) {
  //     console.log(error);
  // });
  db.run("create table fbodata (Name text not null, BAA text not null unique, Agency text, Office text, Location text, Type text, Date text, Link text)");
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
    var table = document.getElementsByClassName('list')[0].children[0].children;
    var links = document.getElementsByClassName('lst-lnk-notice');
    //for (row in table) {
    //var table = document.getElementsByClassName('lst-cl');

    var data = new Array();

    for (var i = 1; i < table.length; i++) {
      // var oppo =      table[i].cells[0].innerText.split('\n')[0];
      // var location =  table[i].cells[1].innerText.split('\n')[0];
      // var type =      table[i].cells[2].innerText.split('\n')[0];
      // var date =      table[i].cells[0].innerText.split('\n')[0];
      var runArray = new Array();

      // ***** map this instead
      for (var value = 0; value < 4; value++) {
        //runArray[value] = table[i].cells[value].innerText;
        runArray.push(table[i].cells[value].innerText.split('\n'));
      }
      runArray.push(links[i - 1].href);
      data.push(runArray);
    }

    return data;
  })
  .end()
  .then(function(data) {

    console.log(data);
    
    var stmt = db.prepare("insert into fbodata values (?, ?, ?, ?, ?, ?, ?, ?)");

    var newEntries = new Array();

    db.serialize(function() {
      for (row in data) {
        var i = 0;
        console.log("\n\nstmt.run", data[row][0][0], data[row][0][1], data[row][1][0], data[row][1][1], data[row][1][2], data[row][2][0], data[row][3][0], data[row][4]);

        stmt.run(data[row][0][0], data[row][0][1], data[row][1][0], data[row][1][1], data[row][1][2], data[row][2][0], data[row][3][0], data[row][4], function(error) {
          console.log("stmt.run error:", error);
          if(error == null) {
            newEntries.push(data[this.lastID - 1]);
          }
        });
      }
    stmt.finalize(function() {
        console.log("finalized");
        console.log(newEntries.length + ' New Opportunities');
        //console.log(newEntries);

        if (newEntries.length != 0) {

          var htmlString = "<div>";
          var htmlStringjs = "";

          for (var j = 0; j < newEntries.length; j++) {
            htmlString += newEntries[j][0][0] + "<br><a href=\"" + newEntries[j][4] + "\">" + newEntries[j][4] + "</a><br><br><br>";
            htmlStringjs += newEntries[j][0][0] + "\n<a href=\"" + newEntries[j][4] + "\">" + newEntries[j][4] + "</a>\n\n\n";
            console.log(htmlStringjs);
          }

          sendmail({
            from: 'FBO-spider-bot',
            to: 'scg104020@utdallas.edu',
            subject: newEntries.length + ' New Opportunities Scanned',
            html: htmlString + "</div>",
          },  
            function(err, reply) {
              console.log(err && err.stack);
              console.dir(reply);
            }
          );
        }
      });
    })
    
    return newEntries;
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  }); 