var api = require('./api');

var createChangePasswordHandlers = function() {
	$('#revealAll').click(function() {
		if ($('#revealAll').prop('checked'))
			$('#changePasswordModal [type="password"]').prop('type', 'text');
		else
			$('#changePasswordModal [type="text"]').prop('type', 'password');
	});

	$('#changePasswordModal input[type="submit"]').click(changePassword);
};

var createResetPasswordCodeHandlers = function() {
	$('#resetPasswordCodeModal input[type="submit"]').click(function(event) {
		event.preventDefault();
		$('#resetPasswordCodeModal').modal('hide');
		//clear for security
		$('#resetPasswordCodeDisplay').val('XXX-XXX-XXX');
	});
};

var showResetPasswordCodeModal = function() {
	$('#resetPasswordCodeModal').modal({
		backdrop: 'static',
		keyboard: false
	});

	api({func: 'generateResetPasswordCode'})
	.then(function(result) {
		if (result.err) {
			alert(result.err);
			return;
		}

		$('#resetPasswordCodeDisplay').val(result.code);

		//dialog cannot be dismissed for 5 seconds so the user reads instructions
		$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', true);
		setTimeout(function() {
			$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', false);
		}, 5 * 1000);
	})
	.then(null, function(jqXHR, textStatus, errorThrown) {
		alert("Server Communication Error: " + jqXHR.statusText);
	});
};

var changePassword = function(event) {
	event.preventDefault();

	api({
		func: 'changePassword',
		newPassword: $('#newPassword').val(),
		oldPassword: $('#currentPassword').val()
	})
	.then(function(result) {
		if (result.err) {
			alert(result.err);
			return;
		}
			
		$('#invalidCurrentPassword').hide();
		$('#invalidNewPassword').hide();
		if (result.invalidOldPassword)
			$('#invalidCurrentPassword').css('display', 'block');
		if (result.invalidNewPassword)
			$('#invalidNewPassword').css('display', 'block');
		if (result.passwordChanged) {
			$('#changePasswordModal').modal('hide');
			clearChangePasswordModal();
			showResetPasswordCodeModal();
		}
	})
	.then(null, function(jqXHR, textStatus, errorThrown) {
		alert("Server Communication Error: " + jqXHR.statusText);
	});
};

var clearChangePasswordModal = function() {
	$('#changePasswordModal form').trigger('reset');
	$('#changePasswordModal [type="text"]').prop('type', 'password');
	$('#changePasswordModal input[type="submit"]').prop('disabled', true);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createChangePasswordHandlers();
	createResetPasswordCodeHandlers();
};

var show = function() {
	$('#changePasswordModal').modal({
		backdrop: 'static',
		keyboard: false
	});
};

module.exports = {
	init: init,
	show: show
};