var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');

request('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.

  jsdom.env(
	  body,
	  ["http://code.jquery.com/jquery.js"],
	  function (err, window) {
	    window.document.getElementById('dnf_class_values_procurement_notice__classification_code___79_check').checked=true;
		window.document.getElementById('dnf_class_values_procurement_notice__naics_code___0220065_check').checked=true;
		window.document.getElementById('dnf_class_values_procurement_notice__procurement_type___k_check').checked=true;

		window.document.getElementsByName('dnf_opt_submit')[1].click();

		request('https://www.fbo.gov/?s=opportunity&mode=list&tab=searchresults', function (error, response, searchresultsbody) {
			console.log('error:', error); // Print the error if one occurred
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			console.log('body:', searchresultsbody); // Print the HTML for the Google homepage.

			fs.writeFile("test.html", searchresultsbody, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			}); 
		});
	  }
	);
});