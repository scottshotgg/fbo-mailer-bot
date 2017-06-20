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

$("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
    $("#success-alert").slideUp(500);
});
