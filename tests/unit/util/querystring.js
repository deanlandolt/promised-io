define([
	'intern!object',
	'intern/chai!assert',
	'../../../util/querystring'
], function (
	registerSuite,
	assert,
	querystring
) {
	registerSuite({
		name: 'promised-io/util/querystring',

		'munge array params': function () {
			var arr = [ "bar", "baz" ];
			var requestParams = [];
			querystring.addToArray(requestParams, "foo", arr);
			assert.deepEqual(requestParams, [ "foo[]", "bar", "foo[]", "baz" ]);
		},

		'munge object params': function () {
			var obj = { "key": "value" };
			var requestParams = [];
			querystring.addToArray(requestParams, "obj", obj);
			assert.deepEqual(requestParams, [ "obj[key]", "value" ]);
		},

		'parse munged querystring': function () {
			var qs = "foo[]=bar&foo[]=baz&obj[key]=value";
			var requestParams = [];
			querystring.parseToArray(requestParams, qs);
			// TODO
			// assert.deepEqual(requestParams, [ "foo[]", "bar", "foo[]", "baz", "obj[key]", "value" ]);
		}
	});
});
