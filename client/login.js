var showResetPasswordCodeModal = function() {
	$('#resetPasswordCodeModal').modal({
		backdrop: 'static',
		keyboard: false
	});

	$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', 'disabled');
	setTimeout(function() {
		$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', '');
	}, 5 * 1000);

	$('#resetPasswordCodeModal input[type="submit"]').click(function(event) {
		event.preventDefault();
		$('#resetPasswordCodeModal').modal('hide');
		//TODO need to display code (not here) then reset form
	});
};

var changePassword = function() {
	$('#changePasswordModal').modal({
		backdrop: 'static',
		keyboard: false
	});

	$('#changePasswordModal input[type="submit"]').click(function(event) {
		event.preventDefault();

		var changePassword = {
			func: 'changePassword',
			newPassword: $('#newPassword').val(),
			oldPassword: $('#currentPassword').val()
		};

		$.ajax({
			url: '/api',
			type :'POST',
			contentType: 'application/json',
			data: JSON.stringify(changePassword)
		})
		.then(function(result) {
			$('#invalidCurrentPassword').css('display', 'none');
			$('#invalidNewPassword').css('display', 'none');
			if (result.invalidOldPassword)
				$('#invalidCurrentPassword').css('display', 'block');
		 	if (result.invalidNewPassword)
				$('#invalidNewPassword').css('display', 'block');
			if (result.passwordChanged) {
				$('#changePasswordModal').modal('hide');
				$('#changePasswordModal form').trigger('reset');
				$('#loginBox input[type="submit"]').prop('disabled', 'disabled');
				showResetPasswordCodeModal();
			}
		})
		.then(null, function(err) {
			alert(err); //TODO handle errors
		});
	});
};

var isFormFilled = function(selector) {
	var formFilled = true;
	selector.find('.text').each(function() {
		if ($(this).val() == '')
			formFilled = false;
	});
	return formFilled;
};

var isChangePasswordFormValid = function() {
	var form = $('#changePasswordModal .modal-body');
	return isFormFilled(form) && $('#newPassword').val() == $('#confirmNewPassword').val();
};

var isResetPasswordFormValid = function() {
	var form = $('#resetPasswordModal .modal-body');
	return isFormFilled(form);
};

var disableSubmitIf = function(value, id) {
	if (value)
		$(id + ' form input[type="submit"]').prop('disabled', 'disabled');
	else
		$(id + ' form input[type="submit"]').prop('disabled', '');
};

var enableSubmitIf = function(value, id) {
	return disableSubmitIf(!value, id);
};

$(function() {
	$('#username, #password').keyup(function() {
		disableSubmitIf($('#username').val() == '' || $('#password').val() == '', '#loginBox');
	});

	$('#resetPasswordCode').keyup(function() {
		enableSubmitIf(isResetPasswordFormValid(), '#resetPasswordModal');
	});

	$('#currentPassword, #newPassword, #confirmNewPassword').keyup(function() {
		enableSubmitIf(isChangePasswordFormValid(), '#changePasswordModal');
		if ($('#newPassword').val() == $('#confirmNewPassword').val())
			$('#mismatchingPasswords').css('display', 'none');
		else
			$('#mismatchingPasswords').css('display', 'block');
	});

	$('#resetPasswordLink').click(function() {
		$('#resetPasswordModal').modal();
	});

	$('#revealAll').click(function() { //TODO
		if ($('#revealAll').prop('checked'))
			$('#changePasswordModal [type="password"]').prop('type', 'text');
		else
			$('#changePasswordModal [type="text"]').prop('type', 'password');
	});

	$('#loginBox input[type="submit"]').click(function(event) { //TODO is putting just loginBox ok?
		event.preventDefault();
		var login = {
			func: 'login',
			username: $('#username').val(),
			password: $('#password').val()
		};

		$.ajax({
			url: '/api',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(login)
		})
		.then(function(result) {
			if (result.err)
				alert(result.err);
			else {
				if (result.auth) {
					$('#loginError').css('display', 'none');
					if (result.changePassword) {
						changePassword();
						$('#loginForm').trigger('reset');
					}
					else {
						console.log('logging in');
						$('#loginForm').trigger('reset');
					}
				}
				else if (result.auth === false)
					$('#loginError').css('display', 'block');
				else
					alert('Unknown response: ' + JSON.stringify(result));
			}
		})
		.then(null, function(err) {
			alert(err); //TODO handle errors
		});
	});
});