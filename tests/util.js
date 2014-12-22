({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define([ '../defer', '../delay' ], function (defer, delay) {
	var util = {};

	util.createForEachable = function (createItem, totalItems, iterationDelay) {
		return {
			createItem: createItem,
			forEach: function(callback) {
				var deferred = defer();
				function next(index) {
					delay(iterationDelay || 0).then(function () {
						if (index < totalItems) {
							callback(createItem(index));
							next(index + 1);
						}
						else {
							deferred.resolve();
						}
					});
				}
				next(0);
				return deferred.promise;
			}
		};
	};

	util.echo = function(value) {
		return delay(util.echo.delay).then(function () {
			return value;
		});
	}
	util.echo.delay = 10;

	util.step = function(context, steps) {
		var next;
		next = function() {
			var fn, result;
			if (!steps.length) {
				return arguments[0];
			}
			fn = steps.shift();
			try {
				result = fn.apply(context, arguments);
				if (result !== void 0) {
					result = defer.when(result, next, next);
				}
			} catch (err) {
				next(err);
			}
			return result;
		};
		return next();
	};

	return util;
});
