module.exports = function(params) {
	var deferred = $.Deferred();
	$.ajax(params).then(function(result) {
		if (result.invalidSession)
			window.location = '/';
		else
			deferred.resolve(result);
	}, deferred.reject);
	return deferred.promise();
};

//TODO handle all API without then errs