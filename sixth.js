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
  db.run("create table fbodata (Name text not null, BAA text not null unique, Classification text, Agency text, Office text, Location text, Type text, Date text, Link text)");
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
    var attributeList = ["Name", "BAA", "Classification", "Agency", "Office", "Location", "Type", "Date", "Link"];

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
    var stmt = db.prepare("insert into fbodata values (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    var htmlString;
    var htmlStringjs;

    db.serialize(function(htmlString) {
      //data.map(function(item, index, htmlString) {
        for (piece of data) {
         stmt.run(Object.values(piece), function(error, htmlString) {
          //console.log("htmlString: ", htmlString);
          console.log("stmt.run error:", error);
          console.log(data[this.lastID - 1]);
          if(error == null) {
            //return item[0] + "<br><a href=\"" + item[8] + "\">" + item[8] + "</a><br><br><br>";
            //console.log(item[0] + "\n<a href=\"" + item[8] + "\">" + item[8] + "</a>\n\n\n");
            //htmlString += piece[0] + "\n<a href=\"" + piece[8] + "\">" + piece[8] + "</a>\n\n\n";
            htmlString += piece[0] + "\n<a href=\"" + piece[8] + "\">" + piece[8] + "</a>\n\n\n";
            //return item[0] + "\n<a href=\"" + item[8] + "\">" + item[8] + "</a>\n\n\n";
          }
          console.log("AfterIf:", htmlString);
        });
      };
    })
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  }); 