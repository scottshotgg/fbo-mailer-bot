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

			//var elements = ['solt', 'soln', 'solcc', 'lst-lnk-notice', 'pagency'];


				// revamp this to just fetch the links and then get everything from the link since it is more straight forward and we already have
				// to load the link anyways

				var rowObjs = [];
				// ----- first box
				$('.lst-rw').map((index, item) => {
					var link;
					var array = ($($(item).children()[0]).children().children().map((index, item) => {
						//console.log(index, $(item).text());

						link = 'https://www.fbo.gov/' + $(item).parent().attr('href');
						return $(item).text().trim();
					}).get());	

					// Insert the unique ID from the database insertion mongo meh ehhh
					rowObjs.push({'Title': array[0], 'Solicitation ID': array[1], 'Classification Code': array[2], 'Link': link});	
				});


				// ---- agency
				$('.pagency').each((index, item) => {
					rowObjs[index]['Agency'] = $(item).text().trim();
				});

				// ----- type
				$('.lst-cl[headers=lh_base_type]').each((index, item) => {
					rowObjs[index]['Type'] =  $(item).text().trim();
				});

				// ----- dates
				$('.lst-cl-first_sort').each((index, item) => {
					rowObjs[index]['Posted Date'] =  $(item)[0]['children'][0]['data'].trim();
				});

				console.log(rowObjs);

				console.log(rowObjs[0]['Link']);

				req.get({
				    url: rowObjs[0]['Link'],
				    headers: {
				        'User-Agent': 'Super Cool Browser' // optional headers
				     }
				  }, function(err, resp, body) {
					  	var $ = cheerio.load(body);

						console.log(body);

						console.log();


						rowObjs[0]['Set Aside'] = $('#dnf_class_values_procurement_notice__set_aside__widget').text().trim();
						rowObjs[0]['Synopsis'] = $('#dnf_class_values_procurement_notice__description__widget').text().trim();
						rowObjs[0]['Point of Contact'] = $('#dnf_class_values_procurement_notice__poc_text__widget').text().trim().split(',').reverse().join(' ');

						console.log(rowObjs[0])
				  });
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
