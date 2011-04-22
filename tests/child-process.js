var test = require("patr/lib/test");
var assert = test.assert;
var childProcess = require("../lib/child-process");
var when = require("../lib/promise").when;

exports.testGet = function() {
	return when(client.request({url: "http://google.com/"}), function(response) {
		assert.ok(response.status < 400, "status should be 2xx or 3xx");
	});
};

if (require.main === module) test.run(exports);
