 // var util = require('util'),
 httpAgent = require('http-agent');
	var fs = require('fs');
var jsdom = require("jsdom");
var agentBefore = httpAgent.create('www.fbo.gov', ['/index?s=opportunity&tab=search&mode=list','/?s=opportunity&mode=list&tab=searchresults:80']);




  
agentBefore.addListener('next', function (e, agent) {
    // Simple usage: Just output the raw
    // HTML returned from each request
    console.log(agentBefore.body);




	jsdom.env(
	  agentBefore.body,
	  ["http://code.jquery.com/jquery.js"],
	  function (err, window) {
	    window.document.getElementById('dnf_class_values_procurement_notice__classification_code___79_check').checked=true;
		window.document.getElementById('dnf_class_values_procurement_notice__naics_code___0220065_check').checked=true;
		window.document.getElementById('dnf_class_values_procurement_notice__procurement_type___k_check').checked=true;

		window.document.getElementsByName('dnf_opt_submit')[1].click();
    	agentBefore.next();
	  }
	);

		fs.writeFile("test.html", agentBefore.body, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 

    agentBefore.next();
  });
  
  agentBefore.addListener('stop', function (e, agent) {
    console.log('Agent has completed visiting all urls');
  });
  
  // Start the agent
  agentBefore.start();