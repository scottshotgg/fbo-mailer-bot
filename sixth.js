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
    var attributeList = ["Name", "BAA", "Classification", "Agency", "Office", "Location", "Type", "Date", "Link"];

    return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
      function(row) {
        return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
          function(item, index) {
          //console.log({[informationMap[index]]: item});
            return {[attributeList[index]]: item};
          }
        )));
      }
    )
  }, db)
  .end()
  .then(function(data) {

    console.log(data);

    return;
    
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

          // sendmail({
          //   from: 'FBO-spider-bot',
          //   to: 'scg104020@utdallas.edu',
          //   subject: newEntries.length + ' New Opportunities Scanned',
          //   html: htmlString + "</div>",
          // },  
          //   function(err, reply) {
          //     console.log(err && err.stack);
          //     console.dir(reply);
          //   }
          // );
        }
      });
    })
    
    return newEntries;
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  }); 