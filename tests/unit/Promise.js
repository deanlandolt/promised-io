define([
	'intern!object',
	'intern/chai!assert',
	'../../Promise'
], function (
	registerSuite,
	assert,
	Promise
) {
	registerSuite({
		name: 'promised-io/Promise',

		'#then': function () {
			var resolved = 'foo';
			return new Promise(function(resolve) {
				setTimeout(function () {
					resolve(resolved);
				});
			}).then(function (value) {
				assert.strictEqual(value, resolved);
			})
		}
	});
});
