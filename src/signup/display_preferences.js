$(document).ready(() => {
	console.log(window.location.pathname);

	if(window.location.pathname.includes('modify')) {
		$.ajax({
			type: "POST",
			url: '/get_display_preferences',
			success: (result) => {
				console.log(result);
				Object.keys(result).map((key, id) => {
					console.log(key, id);
					$('#' + key.replace(/[^a-zA-Z0-9]/g,'_')).val(result[key]).trigger('change');
					console.log('#' + key.replace(/[^a-zA-Z0-9]/g,'_'), result[key]);
				});
			},
			error: (result) => {
				console.log("error", result)
			}
		});
	}
});

params = ["Solicitation ID", "Posted Date", "Place of Performance State", "Place of Performance Zip Code", "Set-Aside Code", "Opportunity/Procurement Type", "Agency", "Office", "Location", "NAICS Code", "Classification Code", "Response Deadline", "Last Modified", "Contract Award Date"];

$('#selection_container').append('<label class="select2-label" for="display_preferences" style="width: 60%; text-align: left;">Display Preferences<br><select id="display_preferences" class="my-select" multiple="multiple" style="width: 100%; padding: 20px;"></select></label>');

$('#display_preferences').select2({
	placeholder: '',
	data: params,
	language: {
        noResults: function() {
            return 'Type in your '
        }
    }

});								

/*
$('.my-select').map((id, select) => {
	return [[].slice.call(select.selectedOptions).map((option, id) => {
		return option.innerText;
	})];
});
*/

function validate_display() {
	console.log('ajax request dawg');

	$.ajax({
	  type: "POST",
	  url: '/validate_display',
	  data: (() => {
			  	return Object.assign(...[].slice.call($(".select2-label")).map((element, id) => {
					var thing = element.innerText.split('\n');
					var data = {[thing[0]]: thing[2].slice(1).split('×')}
					if(window.location.pathname.includes('modify')) {
						data['modify'] = true;
					}
					return data;
				}))
	 		})(),
	  success: (result) => {
	  	// we might need to put this in the backend
	  	//window.location.href = "/display_preferences";
	  	console.log('success', result);
	  	window.location.href = '/' + result.name;
	  },
	  error: (result) => {
	  	console.log("error", result)
	  }
	});
}