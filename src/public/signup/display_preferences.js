
	/*	
		searchOptionNames was generated/retrieved from: 
			https://www.fbo.gov/index?s=opportunity&tab=search&mode=list
		Using: (note that the / on the * is escaped in here but not in the actual source)
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
	
	// var searchOptionNames = ["Posted Date", "Place of Performance State", "Place of Performance Zip Code", "Documents To Search", "Set-Aside Code", "Opportunity/Procurement Type", "Agency/Office/Location(s)", "Specific Agencies / Offices", "Office Location(s)", "Recovery and Reinvestment Act Action", "Keywords or SOL#", "NAICS Code", "Classification Code", "J&A Statutory Authority", "Fair Opportunity / Limited Sources Justification Authority", "Posted Date Range", "Response Deadline", "Last Modified", "Contract Award Date"];

	// console.log(filedata);

	// filedata['Agency'] = [''];
	// delete filedata['Agency/Office/Location(s)'];
	// var filedatakeys = Object.keys(filedata);
	// var mapkeys = filedatakeys.slice(4, -4).concat(filedatakeys[16])
	// console.log(mapkeys);

	//mapkeys = mapkeys.slice()

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
		  dataType: 'json',
		  data: Object.assign(...[].slice.call($(".select2-label")).map((element, id) => {
					var thing = element.innerText.split('\n')
					return {[thing[0]]: thing[2].slice(1).split('×')}
				})),
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