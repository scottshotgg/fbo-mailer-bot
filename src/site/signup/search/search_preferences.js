$(document).ready(() => {
	console.log(window.location.pathname);

	if(window.location.pathname.includes('modify')) {
		$.ajax({
			type: "POST",
			url: '/get_search_preferences',
			success: (result) => {
				Object.keys(result).map((key, id) => {
					$('#' + key.replace(/[^a-zA-Z0-9]/g,'_')).val(result[key]).trigger('change')
				});
			},
			error: (result) => {
				console.log("error", result)
			}
		});

		$('#myModal').modal("toggle");
	}
});




window.setTimeout(function() {
  $(".flash").fadeTo(500, 0).slideUp(500, function(){
      $(this).remove();
  });
}, 5000);




var searchOptionNames = ["Posted Date", "Place of Performance State", "Place of Performance Zip Code", "Documents To Search", "Set-Aside Code", "Opportunity/Procurement Type", "Agency/Office/Location(s)", "Specific Agencies / Offices", "Office Location(s)", "Recovery and Reinvestment Act Action", "Keywords or SOL#", "NAICS Code", "Classification Code", "J&A Statutory Authority", "Fair Opportunity / Limited Sources Justification Authority", "Posted Date Range", "Response Deadline", "Last Modified", "Contract Award Date"];

console.log(filedata);

filedata['Agency'] = [''];
delete filedata['Agency/Office/Location(s)'];
var filedatakeys = Object.keys(filedata);
var mapkeys = filedatakeys.slice(4, -7).concat(filedatakeys[16]);
mapkeys.splice(2, 1);
console.log(mapkeys);

mapkeys.map((key, id) => {
	var keyname = key.replace(/[^a-zA-Z0-9]/g,'_');

	$('#selection_container').append('<div><label class="select2-label" for="' + keyname + '" style="width: 40%; text-align: left;">' + key +'<br><select id="' + keyname + '" class="my-select" multiple="multiple" style="width: 100%; padding: 20px;"></select></label></div>');

	$('#' + keyname).select2({
		placeholder: key + ' search',
		data: filedata[key].map((value, id) => {
			return { id: value, text: value }
		}),
		language: {
            noResults: function() {
                return 'Type in your '
            }
        }

	});	
});

/*
$('.my-select').map((id, select) => {
	return [[].slice.call(select.selectedOptions).map((option, id) => {
		return option.innerText;
	})];
});
*/

function validate_search() {

	if ([].slice.call($(".select2-selection__rendered")).filter((element) => {
		return element.innerText;
	}).length > 0) {		
		$.ajax({
		  type: "POST",
		  url: '/validate_search',
		  data: Object.assign(...[].slice.call($(".select2-label")).filter((element, id) => {
					if (element.innerText.split('\n')[2].length > 1) 
						return true
					}).map((element, id) => {
						var thing = element.innerText.split('\n');
						return {[thing[0]]: thing[2].slice(1).replace('×', '').split(' -- ')[0]}
					})),
		  success: (result) => {
		  	// we might need to put this in the backend
		  	if(window.location.pathname.includes('modify')) {
		  		window.location.href = "/modify_display_preferences";
		  	} else {
		  		window.location.href = "/display_preferences";
		  	}
		  	
		  },
		  error: (result) => {
		  	console.log("error", result)
		  }
		});	
	} else {
		$('#error').html('You must include atleast one search term');
	}
}

/*
Object.assign(...[].slice.call($(".select2-label")).map((element, id) => {
				var thing = element.innerText.split('\n');
				//return {[thing[0]]: thing[2].slice(1).split('×')}
				return {[thing[0]]: thing[2].slice(1).replace('×', '')}
			}))
*/

/*
var object = Object.assign(...[].slice.call(document.getElementsByClassName('field')).map((field) => {
var widget = field.querySelector('.widget');
var label  = field.querySelector('.label').innerText.split('.')[0];
if(label.includes('\n')) {
	return {undefined: undefined}
} else if (widget.lastElementChild.localName == 'br' || widget.lastElementChild.localName == 'label') {
	return {[label]: widget.textContent.split('\n').filter((name) => {
		return /\S/.test(name);
	})};
} else if (widget.lastElementChild.localName == 'table') {
	return {[label]: [].concat.apply([], widget.innerText.split('\t').map((name) => {
		return name.split('\n');
	})).slice(0, -1)};
} else {
	return {[label]: widget.lastElementChild.textContent.split('\n').filter((name) => {
		return /\S/.test(name);
	})};
}
}));

delete object['undefined'];
object['Classification Code'] = object['Classification Code'].slice(0, -1);
*/
/*
.join(',*').split(',*').f,ilter((name) => {
		console.log(name);
		return /\S/.test(name);
	})}


[].slice.call($(".my-select")).map((element, id) => {
return [].slice.call(element.labels[0].children).pop().innerText.slice(1, -1).split('×');
})
*/