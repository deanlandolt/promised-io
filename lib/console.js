// Adapted from node.js (https://github.com/joyent/node/blob/master/lib/console.js)

var promiseModule = require("./promise");
var when = promiseModule.when;
var defer = promiseModule.defer;
var execute = require("./child-process").execute;
//var process = require("./process");

promiseModule.setRepr("-->", "inspect"); // FIXME node-specific

// TODO feature-detect for global console

var _err = process.stderr;
var writeError = function() {
    // stderr always blocks for now
    _err.write.apply(_err, arguments);
};

var _out = process.stdout;
var writeOut = function() {
    if (_out.write.apply(_out, arguments)) return;
    var deferred = defer();
    process.stdout.on("drain", function() {
        deferred.resolve();
    });
    process.stdout.on("error", function(e) {
        deferred.reject(e);
    });
    deferred.promise.toString = function() {};
    return deferred.promise;
};

// console object
var formatRegExp = /%[sdj]/g;
function format(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }


  var i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + util.inspect(x);
    }
  }
  return str;
}


exports.log = function() {
  return writeOut(format.apply(this, arguments) + "\n");
};


exports.info = exports.log;


exports.warn = function() {
  return writeError(format.apply(this, arguments) + "\n");
};


exports.error = exports.warn;


var _inspect = require("util").inspect; // FIXME node-specific
exports.inspect = function() {
    return _inspect.apply(null, arguments);
};

exports.dir = function(object) {
  return writeOut(exports.inspect(object) + "\n");
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
  // TODO probably can to do this better with V8's debug object once that is
  // exposed.
  var err = new Error;
  err.name = 'Trace';
  err.message = label || '';
  Error.captureStackTrace(err, arguments.callee);
  return console.error(err.stack);
};


exports.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, format.apply(this, arr));
  }
};


// from Firebug API
exports.clear = function() {
    // TODO if exports.tty && node repl hook into repl and clear or writeOut(".clear\n")
    // FIXME check availability on otehr platforms
    return writeOut(Buffer([27,91,72,27,91,50,74]));
    
    // lazy fallback
    return when(execute("clear"), function(response) {
        return writeOut(response);
    }, function(e) {
        exports.warn("NYI");
    });
};


var isatty = require("tty").isatty; // FIXME node-specific
Object.defineProperty(exports, "isTTY", {
    get: function() {
        return isatty();
    }
});



// turn on profiling
// takes optional title argument
//exports.profile = function(title) {};

// turn off profiling
//exports.profileEnd = function() {};
