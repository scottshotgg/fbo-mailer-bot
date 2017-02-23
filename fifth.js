var page = require('webpage').create();
var fs = require('fs');

page.open('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    //console.log(page.content);

    var html = page.evaluate(function() {
        document.getElementById('dnf_class_values_procurement_notice__classification_code___79_check').checked=true;
        document.getElementById('dnf_class_values_procurement_notice__naics_code___0220065_check').checked=true;
        document.getElementById('dnf_class_values_procurement_notice__procurement_type___k_check').checked=true;
        
        document.getElementsByName('dnf_opt_submit')[1].click();
        //console.log(document);

        return document.getElementsByName('dnf_opt_submit')[1].documentElement.innerHTML;
    });
    console.log(html);

    fs.write("test.html", html, 'w'); 
  }
  phantom.exit();
});