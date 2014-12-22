define([
	'intern!object',
	'intern/chai!assert',
	'../../coroutine',
	'../../delay',
	'../../stream',
	'../util'
], function (
	registerSuite,
	assert,
	coroutine,
	delay,
	stream,
	util
) {
	registerSuite({
		name: 'promised-io/coroutine',

		success: function () {
			return coroutine(function* (){
				yield delay(100);
				// can yield non-promise values
				var foo = yield 'foo';
				assert.ok(foo === 'foo');
				var result = yield delay(50).then(function () {
					return foo;
				});
				var error = new Error('Boom!');
				var start = new Date();
				try {
					yield delay(100).then(function () {
						throw error;
					});
					// Should never come here
					assert.ok(true === false);
				}
				catch (e) {
					assert.ok(e === error);
					assert.ok(new Date() - start >= 100);
				}
				return result;
			}).then(function (value) {
				assert.ok(value === 'foo');
				return true;
			}, function (e) {
				// Should never come here
				assert.ok(true === false);
			});
		},

		reject: function () {
			var error = new Error('Boom!');
			return coroutine(function* (){
				var start = new Date();
				yield delay(100).then(function () {
					assert.ok(new Date() - start >= 100);
					throw error;
				});
				// Should never come here
				assert.ok(true === false);
			}).then(function () {
				// Should never come here
				assert.ok(true === false);
			}, function (e) {
				assert.ok(e === error);
				return true;
			});
		},

		stream: function () {
			// 	var expectedIndex = 0;

			// 	var stream = util.createForEachable(5);
			// 	return stream(stream, function* (item) {
			// 		assert.strictEqual(item, stream.createItem(expectedIndex));
			// 		expectedIndex++;

			// 		// Should pause when yielding on (resolving) a promise
			// 		var before = new Date();
			// 		var echoed = yield util.echo(item);

			// 		// Echoed result should be yielded back after requisite echo delay
			// 		assert.strictEqual(echoed, item);
			// 		assert.ok(new Date() >= before + util.echo.delay);

			// 		// Should be able to return a promise to exercise backpressure
			// 		// TODO
			// 		// return delay(10);
			// 	}).then(function (result) {
			// 		assert.strictEqual(result, undefined);
			// 	});
		}
	});
});
