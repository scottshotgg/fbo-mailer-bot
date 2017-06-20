$('#modify_preferences_link').click(function(){ 
	console.log('wat');
	getClientData(); 
	return false; 
});

function getClientData() {
	$.ajax({
		type: "POST",
		url: '/modify_search_preferences',
		dataType: 'json',
		success: (result) => {
			console.log(result);
		},
		error: (result) => {
			console.log("error", result)
		}
	});
}
