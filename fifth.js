var page = require('webpage').create();
var fs = require('fs');

page.onLoadFinished = function() {
   page.render('onLoadScreenshot.png');
   //phantom.exit();
}

page.evaluate(function(){
    var a = document.getElementById("target_element_to_be_clicked");
    var e = document.createEvent('MouseEvents');
    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
});

page.open('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    //console.log(page.content);

    var html = page.evaluate(function() {
        document.getElementById('dnf_class_values_procurement_notice__classification_code___79_check').checked=true;
        document.getElementById('dnf_class_values_procurement_notice__naics_code___0220065_check').checked=true;
        document.getElementById('dnf_class_values_procurement_notice__procurement_type___k_check').checked=true;

        //document.getElementsByName('dnf_opt_submit')[1].click();
        //console.log(document);

        return document.getElementsByName('dnf_opt_submit')[1];
    });

    console.log(html);

    fs.write("test.html", html, 'w');

    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
        page.evaluate(function() {
            $(html).click();
            console.log("clicked");
        });
        //phantom.exit()
    }); 

    page.render('afterWriteScreenshot.png');

    page.open('https://www.fbo.gov/?s=opportunity&mode=list&tab=searchresults', function(status) {
        console.log("Status of second load: " + status);
        page.onLoadFinished = function(status) {
            console.log('Load Finished: ' + status);
            page.render('secondPageScreenshot.png');
            phantom.exit();
        };
    });
  }
  phantom.exit();
});