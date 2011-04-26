// Adapted from node.js (https://github.com/joyent/node/blob/master/lib/console.js)
({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory.apply(this, deps.map(require))}}).
define(["./promise", "./process"], function(promise, process){

var whenCall = promise.whenCall;
var defer = promise.defer;
 
var console = exports;

console._writer = require('' + 'util').inspect; // FIXME node-specific

var formatRegExp = /%[sdj]/g;
console._format = function(f) {
    if (typeof f !== 'string') {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
            objects.push(console._writer(arguments[i]));
        }
        return objects.join(process.FIELD_SEP);
    }
  
    var i = 1;
    var args = arguments;
    var str = String(f).replace(formatRegExp, function(x) {
        switch (x) {
            case '%s': return String(args[i++]);
            case '%d': return Number(args[i++]);
            case '%j': return JSON.stringify(args[i++]);
            default: return x;
        }
    });
    
    for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
        if (x === null || typeof x !== 'object') {
            str += process.FIELD_SEP + x;
        }
        else {
            str += process.FIELD_SEP + console._writer(x);
        }
    }
    return str;
};


function write(level, message) {
    // registered writers must be promise-based for the returned promise to be useful
    var deferred = defer();
    // have returned promise object act as if undefined were returned
    deferred.promise.toRepr = function() {}
    // TODO have promise functions return a special "WriteStream" brand of promise to expose pipelined write method
    var stream = console[level].stream;
    if (!stream || typeof stream.write !== 'function') {
        throw new Error('No write stream available for console.' + level);
    }
    // use whenCall to automatically catch and handle if a blocking streams throws
    whenCall([stream.write, stream, message], function(value) {
        // emit event before resolving promise
        emit(level, message);
        deferred.resolve(value);
    }, deferred.reject);
    return deferred.promise;
}
// noop event emitter
function emit() {}

['log', 'info', 'warn', 'error'].forEach(function(level) {
    console[level] = function() {
        return write(level, console._format.apply(this, arguments) + process.RECORD_SEP);
    };
});


console.dir = function(object) {
  return write('dir', console._writer(object) + process.RECORD_SEP);
};


var times = {};
console.time = function(label) {
  times[label] = Date.now();
};


console.timeEnd = function(label) {
  var duration = Date.now() - times[label];
  console.log('%s: %dms', label, duration);
};


console.trace = function(label) {
  // TODO rhino
  var err = new Error;
  err.name = 'Trace';
  err.message = label || '';
  Error.captureStackTrace(err, arguments.callee);
  return write('trace', err.stack);
};


console.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, format.apply(this, arr));
  }
};


// Firebug API
console.clear = function() {
    // FIXME cross-platform solution?
    if (!console.isTTY) throw new Error('The console.clear method can only be called in a tty');
    return write('clear', Buffer([27,91,72,27,91,50,74]));
};

// set default write streams based on node's behavior
var streams = {
    'log': process.stdout,
    'info': process.stdout,
    'warn': process.stderr,
    'error': process.stderr,
    'dir': process.stdout,
    'trace': process.stderr,
    'clear': process.stdout
};
Object.keys(streams).forEach(function(key) {
    console[key].stream = streams[key];
});


var isatty = require('' + 'tty').isatty; // FIXME node-specific
Object.defineProperty(console, 'isTTY', {
    get: function() {
        return isatty();
    }
});



// turns on profiling
// takes optional title argument
//console.profile = function(title) {};

// turn off profiling
//console.profileEnd = function() {};


// TODO move promise to its own package and put the event stuff there
try {
    var _events = require('' + 'events');
    // FIXME node-specific, and we probalby shouldn't mutate the prototype
    console.__proto__ = new (_events.EventEmitter);
    emit = console.emit.bind(console);
}
catch (e) {
    console.warn('Events module not available');
}


return console;
});