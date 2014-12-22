define([
	'intern!object',
	'intern/chai!assert',
	'../../defer',
	'../../LazyArray',
	'../util'
], function (
	registerSuite,
	assert,
	defer,
	LazyArray,
	util
) {

	function createItem(index) {
		return index + '..';
	}

	function createLazyArray(totalLength, iterationDelay) {
		var stream = util.createForEachable(createItem, totalLength, iterationDelay);
		return new LazyArray({
			some: stream.forEach,
			length: totalLength
		});
	}

	var when = defer.when;

	registerSuite({
		name: 'promised-io/LazyArray',

		'#forEach': function () {
			var expectedIndex = 0;
			return createLazyArray(4).forEach(function (item) {
				assert.strictEqual(item, createItem(expectedIndex));
				expectedIndex++;
			}).then(function (result) {
				assert.strictEqual(result, undefined);
				assert.strictEqual(expectedIndex, 4);
			});
		},

		'#toRealArray': function () {
			return when(createLazyArray(3).toRealArray(), function (array) {
				assert.deepEqual(array, [ '0..', '1..', '2..' ]);
			});
		},

		'#map': function () {
			var source = createLazyArray(3);
			var processed = source.map(function (item) {
				return '.' + item.substring(0, 2);
			});

			assert.strictEqual(source.length, 3);
			assert.strictEqual(processed.length, 3);

			return when(processed.toRealArray(), function (array) {
				assert.deepEqual(array, [ '.0.', '.1.', '.2.' ]);
			});
		},

		'#filter': function () {
			var source = createLazyArray(5);
			var processed = source.filter(function (item) {
				return parseInt(item, 10) >= 3;
			});

			assert.strictEqual(source.length, 5);
			assert.strictEqual(processed.length, undefined);

			// TODO: filter should also return a LazyArray
			return when(processed, function (array) {
				assert.deepEqual(array, [ '3..', '4..' ]);
			});
		},

		'#concat': function () {
			var a = createLazyArray(2).map(function (item) {
				return '!' + item;
			});
			var b = createLazyArray(3);
			var c = a.concat(b);
			assert.strictEqual(c.length, 5);
			return when(c.toRealArray(), function (array) {
				assert.deepEqual(array, [ '!0..', '!1..', '0..', '1..', '2..' ]);
				return when(a.toRealArray(), function (array) {
					assert.deepEqual(array, [ '!0..', '!1..' ]);
				});
			});
		},

		'#join': function () {
			var processed = createLazyArray(3).map(function (item) {
				return '..' + item;
			});
			return when(processed.join('  '), function (result) {
				assert.deepEqual(result, '..0..  ..1..  ..2..');
			});
		}
	});

});
