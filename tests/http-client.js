var assert = require("assert");
var when = require("../lib/promise").when;
var client = require("../lib/http-client");

exports.testGet = function() {
	return when(client.request({url: "http://google.com/"}), function(response) {
		assert.ok(response.status < 400, "status should be 2xx or 3xx");
	});
};

if (require.main === module) require("patr/lib/test").run(exports);

