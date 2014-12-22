var promisesAplusTests = require('promises-aplus-tests');
var defer = require('../defer');
var Promise = require('../Promise');

exports.adaptPromise = {
	resolved: Promise.resolve,
	rejected: Promise.reject,
	deferred: function () {
		var resolver, rejecter;
		var promise = new Promise(function (resolve, reject) {
			resolver = resolve;
			rejecter = reject;
		});
		return {
			promise: promise,
			resolve: resolver,
			reject: rejecter
		};
	}
};

exports.adaptDeferred = {
	resolved: function (value) {
		var deferred = defer();
		deferred.resolve(value);
		return deferred.promise;
	},
	rejected: function (reason) {
		var deferred = defer();
		deferred.reject(reason);
		return deferred.promise;
	},
	deferred: function () {
		return defer();
	}
}

function run(adapter, callback) {
	promisesAplusTests(adapter, callback);
}

if (require.main === module) {
	run(exports.adaptPromise, function () {});
	// run(exports.adaptDeferred, function () {});
}
