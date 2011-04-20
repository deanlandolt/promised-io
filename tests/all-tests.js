var assert = require("assert");

exports.testWtf = function() {
	assert.ok(true, "smoke test failed")
};

exports.testHttpClient = require("./http-client");
//exports.testOauth = require("./oauth");
exports.testPromise = require("./promise");
exports.testQuerystring = require("./querystring");

if (require.main === module) require("patr/lib/test").run(exports);

