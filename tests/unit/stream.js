define([
	'intern!object',
	'intern/chai!assert',
	'../../delay',
	'../../stream',
	'../util'
], function (
	registerSuite,
	assert,
	delay,
	stream,
	util
) {

	function createItem(index) {
		return String(index);
	}

	registerSuite({
		name: 'promised-io/stream',

		'#forEach': function () {
			var expectedIndex = 0;
			var stream = util.createForEachable(createItem, 5, 100);
			return stream.forEach(function (item) {
				assert.strictEqual(item, createItem(expectedIndex));
				expectedIndex++;
			}).then(function (resolved) {
				assert.strictEqual(resolved, undefined);
				assert.strictEqual(expectedIndex, 5);
			});
		},

		'#forEachChunk': function () {
			// 	var expectedIndex = 0;
			// 	var stream = util.createForEachable(4, 100);
			// 	return iterator(stream).forOf(function (item) {
			// 		assert.strictEqual(item, createItem(expectedIndex));
			// 		expectedIndex++;
			// 	}).then(function (resolved) {
			// 		assert.strictEqual(resolved, undefined);
			// 		assert.strictEqual(expectedIndex, 4);
			// 	});
		},

		'#next (manual iteration)': function () {
			// 	var expectedIndex = 0;
			// 	var stream = util.createForEachable(3, 100);
			// 	var cursor = iterator(stream);
			// 	// TODO: cursor.next() returns { value: <Promise>, done: false }
		}
	});
});
