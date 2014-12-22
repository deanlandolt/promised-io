define([
	'intern!object',
	'intern/chai!assert',
	'../../defer',
	'../util'
], function (
	registerSuite,
	assert,
	defer,
	util
) {
	function delayedSuccess(delay) {
		var deferred = defer();
		setTimeout(function () {
			deferred.resolve();
		}, delay);
		return deferred.promise;
	}

	function delayedFail(delay) {
		var deferred = defer();
		setTimeout(function () {
			deferred.reject();
		}, delay);
		return deferred.promise;
	}

	function veryDeferred(){
		var deferred = defer();
		setTimeout(function(){
			deferred.resolve(true);
		}, 100);
		return deferred.promise;
	}

	registerSuite({
		name: 'promised-io/defer',

		'speed - plain value': function () {
			for(var i = 0; i < 1000; i++){
				defer.when(3, function(){
				});
			}
		},

		'speed - deferred': function () {
			var deferred = defer();
			for(var i = 0; i < 1000; i++){
				defer.when(deferred.promise, function(){
				});
			}
			deferred.resolve(3);
		},

		'#whenPromise reject handled': function () {
			// The inner whenPromise doesn't have a rejectCallback, but the outer one does.
			// This means the error then *is* handled, but the inner whenPromise doesn't know about that.
			// This shouldn't result in an uncaught exception thrown by the promise library.
			defer.whenPromise(true, function(){
				return defer.whenPromise((function(){
					var deferred = defer();
					deferred.reject({});
					return deferred.promise;
				})());
			}).then(null, function(){});
		},

		'multiple rejections': function () {
			defer.all(delayedFail(25), delayedFail(50), delayedSuccess(75)).then(function () {
				throw new Error('There should be no success here.');
			}, function () {
				// This is where we want to end up, once only.
			});
		},

		'step': function () {
			var deferred = defer();
			util.step({foo: 'bar'}, [
				function(){
					assert.strictEqual(this.foo, 'bar');
					return false;
				},
				function(result){
					assert.isFalse(result);
					this.foo = 'baz';
					return veryDeferred();
				},
				function(result){
					assert.strictEqual(this.foo, 'baz');
					assert.isTrue(result);
					throw Error('Catchme!');
				},
				function(result){
					assert.instanceOf(result, Error);
					assert.strictEqual(result.message, 'Catchme!');
					deferred.resolve(true);
					// return undefined;
				},
				function(result){
					// Should never come here
					deferred.reject(false);
					throw new Error('Should not be invoked')
				},
			]);
			return deferred.promise;
		}
	});
});
