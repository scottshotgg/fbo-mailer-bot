var valObj = {
	firstname: 	false,
	lastname:  	false,
	netid: 		false, 
	email: 		false,
	password: 	false,
	confirm_password: false,
	changed: 	true
};

$(document).ready(() => {
	Object.keys(valObj).map((element, id) => {
		if(!valObj[element]) {
			$('#' + element).triggerHandler("blur");
		}
	});
});


function setElementFeedback(element, success, glyph_success) {
	$(element + '_div').attr('class', 'form-group has-feedback ' + success);
	$(element).next().attr('class', 'glyphicon form-control-feedback ' + glyph_success);
}

function forgotPassword() {
	console.log('hi');
}

function validatePersonalInformation() {
	if(Object.values(valObj).every((element) => {
		return element;
	}))  {

		// We need to determine if they have even changed any data on the page before we resubmit again
		if(valObj.changed) {
			$.ajax({
				type: "POST",
				url: '/validate_personal',
				data: (() => {
					var data = Object.assign(...$("input").map((id, input) => {
						return { [input.id]: input.value };
					}));
					data.password = md5(data['password']);
					data.confirm_password = md5(data['confirm_password']);
					return data;
				})(),
				success: (result) => {
					console.log(result);
					window.location.href = result.location;
				},
				error: (result) => {
					console.log("error", result.responseJSON.error);
					$('#submit_error').text(result.responseJSON.error);
					$('#forgot_password_button').attr('class', 'btn btn-warning');
					valObj.changed = false;
				}
			});
		}
	} else {
		Object.keys(valObj).map((element, id) => {
			if(!valObj[element]) {
				setElementFeedback('#' + element, 'has-error', 'glyphicon-remove');
			}
		});
	}
}


$('#firstname, #lastname').blur(function (e) {
	var callingElement = '#' + e.target.id;
	if($(callingElement).val() != '') {
		var success = 'has-error';
		var glyph_success = 'glyphicon-remove';
		var firstname = $(callingElement).val();
		valObj.changed = true;

		if(firstname && /^[a-zA-Z]+$/.test(firstname)) {

			$(callingElement + '_div').attr('class', 'form-group has-success has-feedback');
			success = 'has-success';
			glyph_success = "glyphicon-ok";
			valObj[callingElement.slice(1)] = true;
			$(callingElement).parent().prev().text('');
		} else {
			$(callingElement).parent().prev().text('Names must only contain English letters');
		}
		setElementFeedback(callingElement, success, glyph_success);
		
	}
});

$('#netid').blur(function (e) {
	var callingElement = '#' + e.target.id;
	if($(callingElement).val() != '') {
		var success = 'has-error';
		var glyph_success = 'glyphicon-remove';
		var netid = $(callingElement).val();
		valObj.changed = true;

		if(netid.length > 8) { 
			if(/^[a-zA-Z]+$/.test(netid.substring(0, 3)) && /^[0-9]+$/.test(netid.substring(3))) {
				// you could do an actual verification here but w/e
				$(callingElement + '_div').attr('class', 'form-group has-success has-feedback');
				success = 'has-success';
				glyph_success = "glyphicon-ok";
				valObj[callingElement.slice(1)] = true;
				valObj['email'] = true;
				$(callingElement).parent().prev().text('');
			}
		} else {
			$(callingElement).parent().prev().text('NetID must be in the form: abc123456');
		}
		setElementFeedback(callingElement, success, glyph_success);
		setElementFeedback('#email', success, glyph_success);
	}
});

$('#password').blur(function (e) {
	var callingElement = '#' + e.target.id;
	if($(callingElement).val() != '') {
		var success = 'has-error';
		var glyph_success = 'glyphicon-remove';
		valObj.changed = true;

		if($(callingElement).val().length > 8) { 
			$(callingElement + '_div').attr('class', 'form-group has-success has-feedback');
			success = 'has-success';
			glyph_success = "glyphicon-ok";
			valObj[callingElement.slice(1)] = true;
			$(callingElement).parent().prev().text('');
		} else {
			$(callingElement).parent().prev().text('Password must be greater than 8 characters');
		}
		setElementFeedback(callingElement, success, glyph_success);
	}
});

$('#confirm_password').blur(function (e) {
	var callingElement = '#' + e.target.id;
	if($(callingElement).val() != '') {
		var success = 'has-error';
		var glyph_success = 'glyphicon-remove';
		valObj.changed = true;

		// nested if made error printing easier
		if($(callingElement).val().length > 8) { 
			if($(callingElement).val() == $('#password').val()) {
				$(callingElement + '_div').attr('class', 'form-group has-success has-feedback');
				success = 'has-success';
				glyph_success = "glyphicon-ok";
				valObj[callingElement.slice(1)] = true;
				$(callingElement).parent().prev().text('');
			} else {
				$(callingElement).parent().prev().text('Password fields must match');
			}
		} else {
			$(callingElement).parent().prev().text('Password must be greater than 8 characters');
		}
		setElementFeedback(callingElement, success, glyph_success);
	}
});

$('#netid').bind('input', function(e) {
	$('#email').val($('#netid').val() + "@utdallas.edu")
});