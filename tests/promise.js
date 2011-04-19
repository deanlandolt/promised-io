var assert = require("assert");
var when = require("../lib/promise").when;
var whenPromise = require("../lib/promise").whenPromise;
var Defer = require("../lib/promise").defer;
var Step = require("../lib/step").Step;

exports.testSpeedPlainValue = function(){
	for(var i = 0; i < 1000; i++){
		when(3, function(){
		});
	}
};

exports.testSpeedPromise = function(){
	var deferred = Defer();
	for(var i = 0; i < 1000; i++){
		when(deferred.promise, function(){
		});
	}
	deferred.resolve(3);
};

exports.testWhenPromiseRejectHandled = function(){
	// The inner whenPromise doesn't have a rejectCallback, but the outer one does.
	// This means the error then *is* handled, but the inner whenPromise doesn't know about that.
	// This shouldn't result in an uncaught exception thrown by the promise library.
	whenPromise(true, function(){
		return whenPromise((function(){
			var deferred = Defer();
			deferred.reject({});
			return deferred.promise;
		})());
	}).then(null, function(){});
};

function veryDeferred(){
	var deferred = Defer();
	setTimeout(function(){
		deferred.resolve(true);
	}, 100);
	return deferred.promise;
}

exports.testStep = function(){
	var deferred = Defer();
	Step({foo: 'bar'}, [
		function(){
			assert.ok(this.foo === 'bar');
			return false;
		},
		function(result){
			assert.ok(result === false);
			this.foo = 'baz';
			return veryDeferred();
		},
		function(result){
			assert.ok(this.foo === 'baz');
			assert.ok(result === true);
			throw Error('Catchme!');
		},
		function(result){
			assert.ok(result instanceof Error);
			assert.ok(result.message === 'Catchme!');
			deferred.resolve(true);
			// return undefined;
		},
		function(result){
			// Should never come here
			deferred.reject(false);
			assert.ok(true === false);
		},
	]);
	return deferred.promise;
};

if (require.main === module) require("patr/lib/test").run(exports);

