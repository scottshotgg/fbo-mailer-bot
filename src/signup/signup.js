function validatePersonalInformation() {
	if([].slice.call($("input")).every((input) => {
		console.log('hi');
		return input.value;
	})) {
		console.log('ajax request dawg');
		$.ajax({
		  type: "POST",
		  url: '/validate_personal',
		  dataType: 'json',
		  data: Object.assign(...$("input").map((id, input) => {
					return {[input.name]: input.value};
				})),
		  success: (result) => {
		  	// might need to put this in the backend
		  	window.location.href = "/search_preferences";
		  },
		  error: (result) => {
		  	console.log("error", result)
		  }
		});
	}
}

$('#firstname').focusout(function (e) {
	if($('#firstname').val() != '') {
		var success = "has-error"
		var glyph_success = "glyphicon-remove";
		var firstname = $('#firstname').val();
1
		if(firstname && /^[a-zA-Z]+$/.test()) {
			// you could do an actual verification here but w/e
			$('#firstname_div').attr('class', 'form-group has-success has-feedback');
			success = 'has-success';
			glyph_success = "glyphicon-ok";
		}

		$('#firstname_div').attr('class', 'form-group has-feedback ' + success);
		$('#firstname').next().attr('class', 'glyphicon form-control-feedback ' + glyph_success);
	}
});

$('#netid').focusout(function (e) {
	console.log('hello');
	console.log($('#netid').val())
	if($('#netid').val() != '') {
		//$('#netid_div').attr('class', 'form-group has-success has-feedback');
		var success = "has-error"
		var glyph_success = "glyphicon-remove";
		var netid = $('#netid').val();

		if(netid.length > 8) { 
			if(/^[a-zA-Z]+$/.test(netid.substring(0, 3)) && /^[0-9]+$/.test(netid.substring(3))) {
				// you could do an actual verification here but w/e
				$('#netid_div').attr('class', 'form-group has-success has-feedback');
				success = 'has-success';
				glyph_success = "glyphicon-ok";
			}
		}

		$('#netid_div').attr('class', 'form-group has-feedback ' + success);
		$('#netid').next().attr('class', 'glyphicon form-control-feedback ' + glyph_success);
		$('#email_div').attr('class', 'form-group has-feedback ' + success);
		$('#email').next().attr('class', 'glyphicon form-control-feedback ' + glyph_success);
	}
});
	
/*
$('#netid').bind('input', function(e) {
	$('#email').val($('#netid').val() + "@utdallas.edu")
});
*/