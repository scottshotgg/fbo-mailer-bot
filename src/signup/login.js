function setElementFeedback(element, success, glyph_success) {
	$(element + '_div').attr('class', 'form-group has-feedback ' + success);
	$(element).next().attr('class', 'glyphicon form-control-feedback ' + glyph_success);
}

function login() {
	$.ajax({
		type: "POST",
		url: '/validate_login',
		data: (() => {
			return { netid: $('#netid').val(), password: md5($('#password').val()) };
		})(),
		success: (result) => {
			// might need to put this in the backend
			window.location.href = "/";
		},
		error: (result) => {
			console.log("error", result);
			$('#error').text('Invalid username and/or password');
			//setElementFeedback('#netid', 'has-error', '');
			//setElementFeedback('#password', 'has-error', '');

			//alert('Invalid login credentials');
		}
	});
}

function signup() {
	window.location.href = "/signup";
}