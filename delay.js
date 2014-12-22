define([
	'./defer',
	'./LazyArray'
], function (defer, LazyArray) {
	/*
	 * Provides time-based promise-returning delay and schedule functions
	 */

	// TODO: has test in require?
	// if (typeof system === "object" && system.engine === "rhino"){
	// 	// for rhino
	// 	return require("./engines/rhino/delay");
	// }

	// returns a promise that is fulfilled after the given number of milliseconds
	function delay(ms){
		var deferred = defer();
		setTimeout(deferred.resolve, ms);
		return deferred.promise;
	};
	// returns a lazy array that iterates one every given number of milliseconds
	delay.schedule = function(ms){
		var callbacks = [];
		setInterval(function(){
			callbacks.forEach(function(callback){
				if(callback()){
					callbacks.splice(callbacks.indexOf(callback), 1);
				}
			});
		}, ms);
		return LazyArray({
			some: function(callback){
				callbacks.push(callback);
			}
		});
	};
	return delay.delay = delay;
});
