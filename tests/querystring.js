var assert = require("assert");
var querystring = require("../lib/util/querystring");

exports.testQuerystring = {
	"test munging array parameters": function() {
		var requestParams = [];
		querystring.addToArray(requestParams, "foo", ["bar", "baz"]);
		assert.deepEqual(requestParams, 
			["foo[]", "bar", "foo[]", "baz"], 
			"each array value should have its own parameter name"
		);
	},
	"test munging object parameters": function() {
		var requestParams = [];
		querystring.addToArray(requestParams,"obj", {"key": "value"});
		assert.deepEqual(requestParams, 
			["obj[key]", "value"], 
			"each property value should have its own parameter name"
		);
	},
	"test parsing a munged query string": function() {
		var requestParams = [];
		querystring.parseToArray(requestParams, "foo[]=bar&foo[]=baz&obj[key]=value");
		assert.deepEqual(requestParams,
			["foo[]", "bar", "foo[]", "baz", "obj[key]", "value"],
			"arrays and objects should retain their own parameter names"
		);
	}
};

if (require.main === module) require("patr/lib/test").run(exports);