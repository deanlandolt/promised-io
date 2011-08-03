/**
* HTTP Client using the JSGI standard objects
*/
var LazyArray = require("../../../lib/lazy-array").LazyArray;

// configurable proxy server setting, defaults to http_proxy env var
exports.proxyServer = require("../../../lib/process").env.http_proxy;

exports.request = function(request){
	var url = new java.net.URL(request.url);
	var connection = url.openConnection();
	var method = request.method || (request.body ? "POST" : "GET");
	var is = null;
	var promised = false;

	if (request.jsgi && "async" in request.jsgi) promised = request.jsgi.async;

	for (var header in request.headers) {
		var value = request.headers[header];
		connection.setRequestProperty(String(header), String(value));
	}
	connection.setFollowRedirects(false)
	connection.setDoInput(true);
	connection.setRequestMethod(method);

	// TODO normative list of non-body methods?
	var hasBody;
	if (request.body && typeof request.body.forEach == 'function') hasBody = true;
	if (['GET', 'OPTIONS', 'DELETE'].indexOf(method) >= 0) hasBody = false;

	if (hasBody) {
		connection.setDoOutput(true);
		// TODO get charset from header
		var writer = new java.io.OutputStreamWriter(connection.getOutputStream(), 'UTF-8');
		request.body.forEach(function(chunk) {
			writer.write(chunk);
			writer.flush();
		});
	}

	if (typeof writer !== "undefined") writer.close();

	try {
		connection.connect();
		is = connection.getInputStream();
	}
	catch (e) {
		is = connection.getErrorStream();
	}

	var status = Number(connection.getResponseCode()),
		headers = {};
	for (var i = 0;; i++) {
		var key = connection.getHeaderFieldKey(i),
			value = connection.getHeaderField(i);
		if (!key && !value)
			break;
		// returns the HTTP status code with no key, ignore it.
		if (key) {
			key = String(key).toLowerCase();
			value = String(value);
			if (headers[key]) {
				if (!Array.isArray(headers[key])) headers[key] = [headers[key]];
				headers[key].push(value);
			}
			else {
				headers[key] = value;
			}
		}
	}

	var reader = new java.io.BufferedReader(new java.io.InputStreamReader(is/*, "UTF-8" FIXME!  */)),
		builder = new java.lang.StringBuilder(),
		line;
	// FIXME create deferred and LazyArray
	while((line = reader.readLine()) != null){
		builder.append(line + '\n');
	}
	if (typeof writer !== "undefined") writer.close();
	reader.close();

	return {
		status: status,
		headers: headers,
		body: LazyArray({
			some: function(write) {
				write(builder.toString());
			}
		})
	}
};