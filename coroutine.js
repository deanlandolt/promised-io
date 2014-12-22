define([
	'./Promise'
], function (Promise) {

	function isGeneratorFunction (obj) {
		return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
	}

	/**
	 * Promise-based coroutine trampoline
	 * Adapted from https://github.com/deanlandolt/copromise/blob/master/copromise.js
	 */
	function run (coroutine) {
		return new Promise(function (resolve, reject) {
			(function next(value, exception) {
				var result;
				try {
					result = exception ? coroutine.throw(value) : coroutine.next(value);
				}
				catch (error) {
					return reject(error);
				}
				if (result.done) return resolve(result.value);
				Promise.resolve(result.value).then(next, function(error) {
					next(error, true);
				});
			})();
		});
	};

	/**
	 * Creates a task from a coroutine, provided as generator. The `yield` function can be provided
	 * a promise (or any value) to wait on, and the value will be provided when the promise resolves.
	 * @param coroutine	 generator or generator function to treat as a coroutine
	 * @return promise for the return value from the coroutine
	 */
	return function spawn(coroutine) {
		if (isGeneratorFunction(coroutine)) {
			coroutine = coroutine();
		}
		return run(coroutine);
	};
});
