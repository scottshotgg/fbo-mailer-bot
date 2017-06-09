
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
					})}
				} else if (widget.lastElementChild.localName == 'table') {
					return {[label]: widget.innerText.split('\t').map((name) => {
						return name.split('\n')
					}).join(',*').split(',*').filter((name) => {
						return /\S/.test(name);
					})}
				} else {
					return {[label]: widget.lastElementChild.textContent.split('\n').filter((name) => {
						return /\S/.test(name);
					})}
				}
			}))

			delete object['undefined']
	*/
	
	var searchOptionNames = ["Posted Date", "Place of Performance State", "Place of Performance Zip Code", "Documents To Search", "Set-Aside Code", "Opportunity/Procurement Type", "Agency/Office/Location(s)", "Specific Agencies / Offices", "Office Location(s)", "Recovery and Reinvestment Act Action", "Keywords or SOL#", "NAICS Code", "Classification Code", "J&A Statutory Authority", "Fair Opportunity / Limited Sources Justification Authority", "Posted Date Range", "Response Deadline", "Last Modified", "Contract Award Date"];

	console.log(filedata);

	Object.keys(filedata).map((key, id) => {
		//return { id: id, text: key, children: filedata[key].map((value, id) => {
		var keyname = key.replace(/[^a-zA-Z0-9]/g,'_');
		document.getElementById('selection_container').innerHTML += '<select id="' + keyname + '" class="my-select" multiple="multiple" style="width: 60%;"></select>';

		$('#' + keyname).select2({
			placeholder: key + ' search',
			data: filedata[key].map((value, id) => {
				console.log(keyname);
				return {id: id, text: value}
			})
		});
		//})};
	});
