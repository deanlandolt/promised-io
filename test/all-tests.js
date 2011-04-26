#!/usr/bin/env node
var test = require("patr");
var assert = test.assert;

exports.testWtf = function() {
	assert.ok(true, "smoke test failed")
};

exports.testPromise = require("./promise");
exports.testProcess = require("./process");
exports.testSubprocess = require("./subprocess");
exports.testQuerystring = require("./querystring");
exports.testHttpClient = require("./http-client");
//exports.testOauth = require("./oauth");

if (require.main === module) test.run(exports);
