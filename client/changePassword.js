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
		$('#resetPasswordCodeDisplay').val('XXX-XXX-XXX');
	});
};

var showResetPasswordCodeModal = function() {
	$('#resetPasswordCodeModal').modal({
		backdrop: 'static',
		keyboard: false
	});

	api({
		url: '/api',
		type :'POST',
		contentType: 'application/json',
		data: JSON.stringify({func: 'generateResetPasswordCode'})
	})
	.then(function(result) {
		$('#resetPasswordCodeDisplay').val(result.code);

		$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', 'disabled');
		setTimeout(function() {
			$('#resetPasswordCodeModal input[type="submit"]').prop('disabled', '');
		}, 5 * 1000);
	})
	.then(null, function(err) {
		alert(err); //TODO handle errors
	});
};

var changePassword = function(event) {
	event.preventDefault();

	var changePassword = {
		func: 'changePassword',
		newPassword: $('#newPassword').val(),
		oldPassword: $('#currentPassword').val()
	};

	api({
		url: '/api',
		type :'POST',
		contentType: 'application/json',
		data: JSON.stringify(changePassword)
	})
		.then(function(result) {
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
		.then(null, function(err) {
			alert(err); //TODO handle errors
		});
};

var clearChangePasswordModal = function() {
	$('#changePasswordModal form').trigger('reset');
	$('#changePasswordModal [type="text"]').prop('type', 'password');
	$('#changePasswordModal input[type="submit"]').prop('disabled', 'disabled');
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