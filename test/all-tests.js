#!/usr/bin/env node
var test = require("patr");
var assert = test.assert;

exports.testWtf = function() {
	assert.ok(true, "smoke test failed")
};

exports.testHttpClient = require("./http-client");
//exports.testOauth = require("./oauth");
exports.testPromise = require("./promise");
exports.testQuerystring = require("./querystring");

if (require.main === module) test.run(exports);
