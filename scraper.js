var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var json = require('jsonify');

req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

if(process.argv[2] == 'f') {
	req.get({
	    url: "https://www.fbo.gov/index?s=opportunity&mode=list&tab=search&tabmode=list&=",
	    headers: {
	        'User-Agent': 'Super Cool Browser' // optional headers
	     }
	  }, function(err, resp, body) {
		
		// load the html into cheerio
		var $ = cheerio.load(body);
		
		// get the data and output to console
		//console.log( 'IP: ' + $('.inner_cntent:nth-child(1) span').text() );
		//console.log( 'Host: ' + $('.inner_cntent:nth-child(2) span').text() );
		//console.log( 'UA: ' + $('.browser span').text() );
		//console.log($);

		var jsobj = 
		'{"_____dummy":"dnf_","so_form_prefix":"dnf_","dnf_opt_action":"search","dnf_opt_template":"7pE4TO+LpSOt6kkfvI3tjzXxVYcDLoQW1MDkvvEnorEEQQXqMlNO+qihNxtVFxhn","dnf_opt_template_dir":"Ni5FF3rCfdHw20ZrcmEfnbG6WrxuiBuGRpBBjyvqt1KAkN/anUTlMWIUZ8ga9kY+","dnf_opt_subform_template":"ofIwRcnIObMpvmYWChWtsWF719zd85B9","dnf_opt_finalize":"1","dnf_opt_mode":"update","dnf_opt_target":"","dnf_opt_validate":"1","dnf_class_values[procurement_notice][dnf_class_name]":"procurement_notice","dnf_class_values[procurement_notice][notice_id]":"fa10da501d41bea54e485d6b274b671f","dnf_class_values[procurement_notice][_so_agent_save_agent]":"","dnf_class_values[procurement_notice][custom_response_date]":"","dnf_class_values[procurement_notice][custom_posted_date]":"","dnf_class_values[procurement_notice][zipstate][]":"","dnf_class_values[procurement_notice][zipcode]":"","dnf_class_values[procurement_notice][searchtype]":"active","dnf_class_values[procurement_notice][set_aside][]":"","dnf_class_values[procurement_notice][procurement_type][]":"","dnf_class_values[procurement_notice][all_agencies]":"all","dnf_class_values[procurement_notice][agency][dnf_class_name]":"agency","_status_43b364da3bd91e392aab74a5af5fd803":"0","dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_input_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","autocomplete_hidden_dnf_class_values[procurement_notice][agency][dnf_multiplerelation_picks][]":"","dnf_class_values[procurement_notice][recovery_act]":"","dnf_class_values[procurement_notice][keywords]":"","dnf_class_values[procurement_notice][naics_code][]":"","dnf_class_values[procurement_notice][classification_code][]":"","dnf_class_values[procurement_notice][ja_statutory][]":"","dnf_class_values[procurement_notice][fair_opp_ja][]":"","dnf_class_values[procurement_notice][posted_date][_start]":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_start]_real":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_end]":"2017-05-08","dnf_class_values[procurement_notice][posted_date][_end]_real":"2017-05-08","dnf_class_values[procurement_notice][response_deadline][_start]":"","dnf_class_values[procurement_notice][response_deadline][_start]_real":"","dnf_class_values[procurement_notice][response_deadline][_end]":"","dnf_class_values[procurement_notice][response_deadline][_end]_real":"","dnf_class_values[procurement_notice][modified][_start]":"","dnf_class_values[procurement_notice][modified][_start]_real":"","dnf_class_values[procurement_notice][modified][_end]":"","dnf_class_values[procurement_notice][modified][_end]_real":"","dnf_class_values[procurement_notice][contract_award_date][_start]":"","dnf_class_values[procurement_notice][contract_award_date][_start]_real":"","dnf_class_values[procurement_notice][contract_award_date][_end]":"","dnf_class_values[procurement_notice][contract_award_date][_end]_real":""}';

		console.log(JSON.parse(jsobj));
		//process.exit();
		var form = $('#vendor_procurement_notice_search').serializeArray();
		console.log($(form).serializeArray());


		var newform = Object.assign(...$('#vendor_procurement_notice_search').serializeArray().map((item, index) => {
			console.log(index, item);
			console.log();

			return {[item.name]: item.value};
		}));

		/*
		newform['_month_dnf_class_values[procurement_notice][posted_date][_start]'] = '05';
  		newform['_day_dnf_class_values[procurement_notice][posted_date][_start]'] = '05';
  		newform['_year_dnf_class_values[procurement_notice][posted_date][_start]'] = '2017';
		*/
		newform['dnf_class_values[procurement_notice][posted_date][_start]'] = '2017-05-08';
		newform['dnf_class_values[procurement_notice][posted_date][_start]_real'] = '2017-05-08';
		/*
		newform['_month_dnf_class_values[procurement_notice][posted_date][_end]'] = '05';
  		newform['_day_dnf_class_values[procurement_notice][posted_date][_end]'] = '05';
  		newform['_year_dnf_class_values[procurement_notice][posted_date][_end]'] = '2017';
		*/
		newform['dnf_class_values[procurement_notice][posted_date][_end]'] = '2017-05-08';
		newform['dnf_class_values[procurement_notice][posted_date][_end]_real'] = '2017-05-08';

		newform['dnf_opt_finalize'] = 1;
		//newform['dnf_opt_validate'] = 0;

		// newform['dnf_class_values[procurement_notice][posted_date][_start]_real'] = '2017-05-05';
		// newform['dnf_class_values[procurement_notice][posted_date][_end]_real'] = '2017-05-05';


		//newform['dnf_class_values[procurement_notice][custom_posted_date]'] = '2017-05-05';

		console.log(newform);
		//process.exit();

		req.post({
		    url: "https://www.fbo.gov/?s=opportunity&mode=list&tab=searchresults&pp=100",
		    form: jsobj,
		    headers: {
		        'User-Agent': 'Super Cool Browser' // optional headers
		     }
		  }, function(err, resp, body) {

		  	fs.writeFile("test", body, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			});
			
			// load the html into cheerio
			var $ = cheerio.load(body);

			console.log(body);

			console.log();

			var thing = $($('.lst-cnt')[0]).text(); 

			console.log(thing);



			var list = $('.lst-rw');
			//console.log(list);

			// [].slice.call(list).map((row, index) => {
			// 	console.log(row.)
			// });

			//[].slice.call($('.lst-rw')).map((row, index) => {return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {return {[attributeList[index]]: item};})));});


			// [].slice.call($('.lst-rw')).map((row, index) => {
			// 	return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {
			// 		return {[attributeList[index]]: item};
			// 	}))); 
			// });

			//[].slice.call($('.lst-rw')).map((row, index) => {
				// return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map((item, index) => {
				// 	return {[attributeList[index]]: item};
				// }))); 

				//console.log(index, row);

			//});

			var children = $(list[0]).children();

			// children.map((child) => {
			// 	//console.log($(children[child]).text().trim());
			
			// 	console.log($(children)[child].children())
			// });

			//console.log($(children[0]).children().text());
			// var text = $('.lst-rw').contents().map(function() {
			//         return $(this).text().trim()
			// }).get();

			var conts = $('.lst-cl').contents();

			var contdata = [];

			console.log($(conts[0]).next().attr('href'));

			$('.lst-cl').contents().map(function(i, el) {
			  if($(this).children().length > 0) {
			  	$(this).contents().map(function(i, el) {
			  		//console.log($(el).text().trim());
			  		var data = $(el).text().trim();
			  		if(data != '')
			  			contdata.push(data);
			  	});
			  } else {
			  	//console.log($(this).text().trim());
				  	var data = $(el).text().trim();
				  	if(data != '')
				  		contdata.push(data);
			  }
			});

			//console.log(contdata);

			//console.log(conttext);

			//console.log($(conts[0]).text());
			//console.log($(conts[1]).contents().text());
			//console.log($(conts[2]).contents());

			// conts.map((index, item) => {
			// 	console.log($(item).children());
			// });

			// var text = $('.solt').contents().map((item) => {
			// 	return $(this);
			// }).get();


			// THIS WORKS >>>>>

			// var solt = $('.solt').contents().map((index, item) => {
			// 	return ($(item).text());
			// });

			// var soln = $('.soln').contents().map((index, item) => {
			// 	return ($(item).text());
			// });

			// var solcc = $('.solcc').contents().map((index, item) => {
			// 	return ($(item).text());
			// });


			// for(var x = 0; x < 100; x++) {
			// 	console.log(solt[x]);
			// 	console.log(soln[x]);
			// 	console.log(solcc[x]);
			// 	console.log();
			// }


			//console.log(solt);

			process.exit();

			$('.solt').map((item, index) => {
				console.log($());
			}).get();


			// console.log($($(conts[0]).next().contents()[1]).contents());

			// var text = $(conts[0]).next().contents().map(() => {
			// 	return $(this).text();
			// }).get();

			// console.log(text);

		});
	});

} else {
	fs.readFile('test', 'utf8', function(err, contents) {
	    console.log(contents, '\n\n');


	    var $ = cheerio.load(contents);

	    console.log($);
	    
	    var thing = $($('.lst-cnt')[0]).text(); 


	    console.log($ + '\n\n' + typeof thing + '\n\n');
	    console.log(thing);

	});
}
