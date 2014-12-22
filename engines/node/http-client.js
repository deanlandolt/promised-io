({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define([
	'../.././defer',
	'../../LazyArray'
],
function(defer, LazyArray) {
	/**
	* HTTP Client using the JSGI standard objects
	*/

	var http = (require.nodeRequire || require)("http");
	var https = (require.nodeRequire || require)("https");
	var parse = (require.nodeRequire || require)("url").parse;
	var exports = {};

	// configurable proxy server setting, defaults to http_proxy env var
	exports.proxyServer = process.env.http_proxy;

	exports.request = function(originalRequest){
		// make a shallow copy of original request object
		var request = {};
		for(var key in originalRequest){
			if(originalRequest.hasOwnProperty(key)){
				request[key] = originalRequest[key];
			}
		}

		if(request.timeout === undefined)request.timeout= 20000; // default timeout.
		if(request.url){
			var parsed = parse(request.url);
			if (parsed.pathname) {
				parsed.pathInfo = parsed.pathname;
			} else {
				parsed.pathInfo = "/";
			}
			request.queryString = parsed.query || "";
			for(var i in parsed){
				request[i] = parsed[i];
			}
		}
		var deferred = defer();
		if(exports.proxyServer){
			request.pathname = request.url;
			var proxySettings = parse(exports.proxyServer);
			request.port = proxySettings.port;
			request.protocol = proxySettings.protocol;
			request.hostname = proxySettings.hostname;
		}
		if(!request.protocol){
			throw new Error("No valid protocol/URL provided");
		}
		var timedOut, bodyDeferred;
		// Limits the time of sending the request + receiving the response header to 20 seconds.
		// No timeout is used on the client stream, but we do destroy the stream if a timeout is reached.
		var timeout = setTimeout(function(){
			timedOut = true;
			req.destroy();
			deferred.reject(new Error("Timeout"));
		}, request.timeout);

		var secure = request.protocol.indexOf("s") > -1;
		request.port = request.port || (secure ? 443 : 80);
		request.headers = request.headers || {host: request.host || request.hostname + (request.port ? ":" + request.port : "")};
		request.host = request.hostname;
		request.method = request.method || "GET";
		request.path = request.pathname || request.pathInfo || "";
		if (request.queryString) {
		  request.path += "?"+request.queryString;
		}
		var timedOut;

		var req = (secure ? https : http).request(request);
		req.on("response", function (response){
			if(timedOut){
				return;
			}
			response.status = response.statusCode;
			var sendData = function(block){
				buffer.push(block);
			};
			var buffer = [];
			bodyDeferred = defer();
			var body = response.body = LazyArray({
				some: function(callback){
					buffer.forEach(callback);
					sendData = callback;
					return bodyDeferred.promise;
				}
			});
			response.setEncoding(request.encoding || "utf8");

			response.on("data", function (chunk) {
				sendData(chunk);
			});
			response.on("end", function(){
				bodyDeferred.resolve();
			});
			deferred.resolve(response);
			clearTimeout(timeout);
		});
		req.on('error', function(e) {
			if (!timedOut) {
	            deferred.reject(e);
	            clearTimeout(timeout);
	        }
		});
		if(request.body){
			return defer.when(request.body.forEach(function(block){
				req.write(block);
			}), function(){
				req.end();
				return deferred.promise;
			});
		}else{
			req.end();
			return deferred.promise;
		}
	};

	return exports;
});
