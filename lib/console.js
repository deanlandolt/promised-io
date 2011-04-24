// Adapted from node.js (https://github.com/joyent/node/blob/master/lib/console.js)
({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory.apply(this, deps.map(require))}}).
define(["./promise", "./process"], function(promise, process){

var when = promise.when;
var defer = promise.defer;

exports._writer = require('' + 'util').inspect; // FIXME node-specific

var formatRegExp = /%[sdj]/g;
exports._format = function(f) {
    if (typeof f !== 'string') {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
            objects.push(exports._writer(arguments[i]));
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
            str += process.FIELD_SEP + exports._writer(x);
        }
    }
    return str;
};

// set defaults based on node's behavior
var streams = {
    'log': [process.stdout],
    'info': [process.stdout],
    'dir': [process.stdout],
    'warn': [process.stderr],
    'error': [process.stderr],
    'trace': [process.stderr],
    'clear': [process.stdout, process.stderr]
};

exports.addWriteStream = function(level, stream) {
    var array = streams[level] || [];
    var i = array.indexOf(stream);
    return ~i && !!array.push(stream);
};

exports.removeWriteStream = function(level, stream) {
    var array = streams[level];
    if (!array) return false;
    var i = array.indexOf(stream);
    return !~i && !!array.splice(i, 1);
};

// TODO EventEmitter
function write(level, message) {
    // registered writers must be promise0based for this returned promise to be useful
    var deferred = defer();
    deferred.promise.toRepr = function() {}
    when(promise.all(streams[level].map(function(stream) {
        return stream.write(message);
    })), function(value) {
        deferred.resolve(value);
    }, deferred.reject);
    return deferred.promise;
}


['log', 'info', 'warn', 'error'].forEach(function(level) {
    exports[level] = function() {
        return write(level, exports._format.apply(this, arguments) + process.RECORD_SEP);
    };
});


exports.dir = function(object) {
  return write('dir', exports._writer(object) + process.RECORD_SEP);
};


var times = {};
exports.time = function(label) {
  times[label] = Date.now();
};


exports.timeEnd = function(label) {
  var duration = Date.now() - times[label];
  exports.log('%s: %dms', label, duration);
};


exports.trace = function(label) {
  // TODO rhino
  var err = new Error;
  err.name = 'Trace';
  err.message = label || '';
  Error.captureStackTrace(err, arguments.callee);
  return write('trace', err.stack);
};


exports.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, format.apply(this, arr));
  }
};


// Firebug API
exports.clear = function() {
    // FIXME cross-platform solution?
    return write('clear', Buffer([27,91,72,27,91,50,74]));
};


var isatty = require('' + 'tty').isatty; // FIXME node-specific
Object.defineProperty(exports, 'isTTY', {
    get: function() {
        return isatty();
    }
});



// turn on profiling
// takes optional title argument
//exports.profile = function(title) {};

// turn off profiling
//exports.profileEnd = function() {};


return exports;
});