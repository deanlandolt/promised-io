var test = require('patr');
var assert = test.assert;
var when = require('../lib/promise').when;
var process = require('../lib/process');

exports.testOutput = {
    testPrint: function() {
        return when(process.print('a', 0, ['b', null, 1], {}), function(value) {
            assert.equal(value, 'a 0 b,,1 [object Object]\n');
        });
    },
    testPuts: function() {
        return when(process.puts('a', 0, ['b', null, 1], {}), function(value) {
            assert.equal(value, 'a\n0\nb,,1\n[object Object]\n');
        });
    },
    testProperties: function() {
        assert.equal(typeof process.pid, 'number');
        assert.equal(typeof process.uid, 'number');
        assert.equal(typeof process.gid, 'number');
        assert.ok(process.pid > 0);
        assert.ok(process.uid > 0);
        assert.ok(process.gid > 0);
        
        var memory = process.memory;
        var keys = Object.keys(memory).sort();
        assert.deepEqual(keys, ['heapTotal', 'heapUsed', 'rss', 'vsize']);
        keys.forEach(function(key) {
            assert.equal(typeof memory[key], 'number');
        });
        
        //assert.equal(typeof process.global, 'object');
        assert.equal(typeof process.env, 'object');
        assert.ok(Array.isArray(process.args));
    }
    
    // TODO use a child process to test
};

if (require.main === module) test.run(exports);
