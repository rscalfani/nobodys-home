var api = require('./api');
var changePassword = require('./changePassword');
var configuration = require('./configuration');

var isFormFilled = function(selector) {
	var formFilled = true;
	selector.find('.text').each(function() {
		if ($(this).val() == '')
			formFilled = false;
	});
	return formFilled;
};

var disableSubmitIf = function(value, id) {
	if (value)
		$(id + ' form input[type="submit"]').prop('disabled', true);
	else
		$(id + ' form input[type="submit"]').prop('disabled', false);
};

var enableSubmitIf = function(value, id) {
	return disableSubmitIf(!value, id);
};

var isChangePasswordFormValid = function() {
	var form = $('#changePasswordModal .modal-body');
	return isFormFilled(form) && $('#newPassword').val() == $('#confirmNewPassword').val();
};

var createLoginHandlers = function() {
	$('#username, #password').keyup(function() {
		disableSubmitIf($('#username').val() == '' || $('#password').val() == '', '#loginBox');
	});

	$('#currentPassword, #newPassword, #confirmNewPassword').keyup(function() {
		enableSubmitIf(isChangePasswordFormValid(), '#changePasswordModal');
		if ($('#newPassword').val() == $('#confirmNewPassword').val())
			$('#mismatchingPasswords').hide();
		else
			$('#mismatchingPasswords').css('display', 'block');
	});

	$('#loginBox input[type="submit"]').click(function(event) {
		event.preventDefault();

		api({
			func: 'login',
			username: $('#username').val(),
			password: $('#password').val()
		})
		.then(function(result) {
			if (result.err) {
				alert(result.err);
				return;
			}

			if (result.auth) {
				if (result.changePassword)
					changePassword.show();
				else
					window.location = '#webServer';
				//clear login info for security
				clearLoginBox();
				clearResetPasswordModal();
			}
			else if (result.auth === false)
				$('#loginError').css('display', 'block');
			else
				alert('Unknown response: ' + JSON.stringify(result));
		})
		.then(null, function(jqXHR, textStatus, errorThrown) {
			alert("Server Communication Error: " + jqXHR.statusText);
		});
	});
};

var createResetPasswordHandlers = function() {
	$('#resetPasswordLink').click(function() {
		$('#resetPasswordModal').modal();
	});

	$('#resetPasswordCode1').keyup(function() {
		if ($('#resetPasswordCode1').val().length == 3)
			$('#resetPasswordCode2').focus();
	});

	$('#resetPasswordCode2').keyup(function() {
		if ($('#resetPasswordCode2').val().length == 3)
			$('#resetPasswordCode3').focus();
	});

	$('#resetPasswordCode1, #resetPasswordCode2, #resetPasswordCode3').keyup(function() {
		enableSubmitIf($('#resetPasswordCode1').val().length == 3 && $('#resetPasswordCode2').val().length == 3 && $('#resetPasswordCode3').val().length == 3, '#resetPasswordModal');
	});

	$('#resetPasswordModal form input[type="submit"]').click(function() {
		event.preventDefault();

		var code = $('#resetPasswordCode1').val() + $('#resetPasswordCode2').val() + $('#resetPasswordCode3').val();

		api({func: 'resetPassword', code: code})
		.then(function(result) {
			if (result.err) {
				alert(result.err);
				return;
			}

			if(result.passwordReset){
				$('#resetPasswordModal').modal('hide');
				clearLoginBox();
				clearResetPasswordModal();
				changePassword.show();
			}
			else
				$('#invalidResetPasswordCode').css('display', 'block');
		})
		.then(null, function(jqXHR, textStatus, errorThrown) {
			alert("Server Communication Error: " + jqXHR.statusText);
		});
	});
};

var clearLoginBox = function() {
	$('#loginForm').trigger('reset');
	$('#loginBox input[type="submit"]').prop('disabled', true);
	$('#loginError').hide();
};

var clearResetPasswordModal = function() {
	$('#resetPasswordModal form').trigger('reset');
	$('#resetPasswordModal form input[type="submit"]').prop('disabled', true);
	$('#invalidResetPasswordCode').hide();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createLoginHandlers();
	createResetPasswordHandlers();
};

var clear = function() {
	clearLoginBox();
	document.title = 'Nobody\'s Home | Login';
};

module.exports = {
	init: init,
	clear: clear
};