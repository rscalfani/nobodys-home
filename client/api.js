module.exports = function(apiObj) {
	var deferred = $.Deferred();
	$.ajax({
		url: '/api',
		type :'POST',
		contentType: 'application/json',
		data: JSON.stringify(apiObj)
	}).then(function(result) {
		if (result.invalidSession)
			window.location = '#';
		else
			deferred.resolve(result);
	}, deferred.reject);
	return deferred.promise();
};