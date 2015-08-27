(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

	$.ajax({
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
},{}],2:[function(require,module,exports){
//TODO HANDLE API ERR RETURNS {err: 'message'}

var changePassword = require('./changePassword');

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
		$(id + ' form input[type="submit"]').prop('disabled', 'disabled');
	else
		$(id + ' form input[type="submit"]').prop('disabled', '');
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
			$('#mismatchingPasswords').css('display', 'none');
		else
			$('#mismatchingPasswords').css('display', 'block');
	});

	$('#loginBox input[type="submit"]').click(function(event) {
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
			if (result.err) //TODO do I need this? If so, should I put it after the other ajax calls?
				alert(result.err);
			else {
				if (result.auth) {
					if (result.changePassword)
						changePassword.show();
					else
						hide();
					clearLoginBox();
					clearResetPasswordModal();
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
		if ($('#resetPasswordCode1').val().length == 3 && $('#resetPasswordCode2').val().length == 3 && $('#resetPasswordCode3').val().length == 3)
			$('#resetPasswordModal form input[type="submit"]').prop('disabled', '');
		else
			$('#resetPasswordModal form input[type="submit"]').prop('disabled', 'disabled');
	});

	$('#resetPasswordModal form input[type="submit"]').click(function() {
		event.preventDefault();

		var code = $('#resetPasswordCode1').val() + $('#resetPasswordCode2').val() + $('#resetPasswordCode3').val();

		$.ajax({
			url: '/api',
			type :'POST',
			contentType: 'application/json',
			data: JSON.stringify({func: 'getResetPasswordCode', code: code})
		})
		.then(function(result) {
			if(result.passwordReset){
				console.log("initiate change password");
				$('#resetPasswordModal').modal('hide');
				clearLoginBox();
				clearResetPasswordModal();
				changePassword.show();
			}
			else {
				console.log("do not change password");
				$('#invalidResetPasswordCode').css('display', 'block');
			}
		})
		.then(null, function(err) {
			alert(err); //TODO handle errors
		});
	});
};

var clearLoginBox = function() {
	$('#loginForm').trigger('reset');
	$('#loginBox input[type="submit"]').prop('disabled', 'disabled');
	$('#loginError').css('display', 'none');
};

var clearResetPasswordModal = function() {
	$('#resetPasswordModal form').trigger('reset');
	$('#resetPasswordModal form input[type="submit"]').prop('disabled', 'disabled');
	$('#invalidResetPasswordCode').css('display', 'none');
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var init = function() {
	createLoginHandlers();
	createResetPasswordHandlers();
};

var show = function() {
	clearLoginBox();
	$('#loginBox').show();
};

var hide = function() {
	$('#loginBox').hide();
	clearLoginBox();
};

module.exports = {
	init: init,
	show: show,
	hide: hide
};
},{"./changePassword":1}],3:[function(require,module,exports){
var login = require('./login');
var changePassword = require('./changePassword');

$(function() {
	login.init();
	changePassword.init();
	login.show();
});


},{"./changePassword":1,"./login":2}]},{},[3]);
