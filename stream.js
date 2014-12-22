define([
	'./Promise'
], function (Promise) {

	// a promised stream is like a sequence of sequences

	// it can be iterated element by element using "forEach", or by chunk using "forEachChunk"

	//  using es6 for..of syntax within a coroutine

	// alternatively, chunks can be iterated individually using `for (var element of stream)`
	// or by chunk using `for (var chunk of stream.chunks)`

	// when iterating a promised stream, calling `next` returns a value promise and a done boolean

	// if done is true, the value represents the "return value" of the stream
	// this is inaccessible when using for..of syntax
	// this is the value resolved by the promise returned from forEach or forEachChunk


	// wraps a forEachable or Readable node stream with the promised-io stream interface
	function Stream(source) {
	}

	Stream.prototype.forEachChunk = function (handler) {

	};

	return Stream;
});
