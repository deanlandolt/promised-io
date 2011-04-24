({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory.apply(this, deps.map(require))}}).
define(["./promise"], function(promise){

var defer = promise.defer;
var when = promise.when;

// FIXME it would be best to just do the browser work here
// we can move the node/commonjs code to platform modules

var process = exports;

// gather platform data
var _system, _process, nodeLike, commonjsLike, browserLike;
if (typeof global == 'object' && typeof global.process != "undefined") {
    _process = global.process;
    nodeLike = true;
}

try {
    _system = require('' + 'system'); // bypass static analysis
    commonjsLike = true;
} catch (e) {};

if (typeof navigator != 'undefined' && typeof location != 'undefined') {
    browserLike = true;
}


// prep stdio

function replDefer() {
    var deferred = defer();
    deferred.promise.toRepr = function() {}
    return deferred;
}

function bindWrite(func, thisp) {
    return function boundWrite(value) {
        var deferred = replDefer();
        try {
            when(value, function(value) {
                return promise.whenCall([func, thisp, value], function() {
                    deferred.resolve(value);
                });
            }, deferred.reject);
        }
        catch (e) {
            deferred.reject(e);
        }
        return deferred.promise;
    };
}
function writeNoop(value) {
    var deferred = replDefer();
    when(value, function(value) {
        deferred.resolve(value);
    }, deferred.reject);
    return deferred.promise;
}
var writeOut = writeNoop;
var writeErr = writeNoop;

if (nodeLike) {
    writeOut = function (value) {
        var deferred = replDefer();
        when(value, function(value) {
            try {
                var flushed = _process.stdout.write(value);
                if (flushed) {
                    deferred.resolve(value);
                }
                else {
                    _process.stdout.on('drain', function() {
                        deferred.resolve(value);
                    });
                    _process.stdout.on('error', function(e) {
                        deferred.reject(e);
                    });
                }
            }
            catch (e) {
                deferred.reject(e);
            }
        });
        return deferred.promise;
    };
    writeErr = bindWrite(_process.stderr.write, _process.stderr);
}
else if (commonjsLike) {
    // assume blocking or promised io
    writeOut = bindWrite(_system.stdout.write, _system.stdout);
    writeErr = bindWrite(_system.stderr.write, _system.stderr);
}
else if (browserLike) {
    // TODO add hooks for DOM nodes to be supplied as proxies for stdio streams 
    // default stdin to document content?
    
    // use the console object if available
    if (typeof console != 'undefined') {
        writeOut = bindWrite(console.log, console);
        writeErr = bindWrite(console.error || console.log, console);
    }
    else if (typeof document != "undefined") {
        // ugh...fall back to document.write
        writeOut = writeErr = bindWrite(document.write, document);
    }
}


// save existing print function
var _print = typeof print == 'function' ? print : null;


// stdio
process.stdin = {
    read: function(){} // TODO
};
process.stdout = {
    write: writeOut
};
process.stderr = {
    write: writeErr
};


// stdout helpers

process.FIELD_SEP = ' ';
process.RECORD_SEP = '\n';
function formatLine(args, fieldSep, recordSep) {
    fieldSep = fieldSep != null ? fieldSep : process.FIELD_SEP;
    recordSep = recordSep != null ? recordSep : process.RECORD_SEP
    return Array.prototype.join.call(args, fieldSep) + recordSep;
}

// TODO ensure all works with mixed promises and non promises
function bindWriteLine(fieldSep, recordSep) {
    return function() {
        return when(promise.all(Array.prototype.slice.call(arguments)), function(args) {
            return writeOut(formatLine(args, fieldSep, recordSep));
        });
    };
}
process.print = bindWriteLine(' ');
process.puts = bindWriteLine('\n');


function define(obj, prop, desc) {
    if (desc.enumerable == null) desc.enumerable = true;
    if (desc.configurable == null) desc.configurable = true;
    Object.defineProperty(obj, prop, desc);
}


if (browserLike) {
    process.args = [location.pathname, location.search, location.hash].filter(function(arg) {
        return arg;
    });
    // process.env = ??? navigator?
    
    // globals
    process.global = window;
    
    // exit
    // should we tie into a window close hook?
}


if (commonjsLike) {
    var system = require('' + 'system'); // bypass static analysis
	process.args = _system.args;
	process.env = _system.env;
	
	// globals
	if (_system.global) {
	    // narwhal
	    process.globals = _system.global;
	}
	else if (typeof global != 'undefined') {
	    // ringo
	    process.global = global;
	}
	
	// exit
	process.exit = require('' + 'os').exit;
}


if (nodeLike) {
    
    // patch util.inspect to respect toRepr function
    var _util = require('' + 'util');
    var _inspect = _util.inspect;
    _util.inspect = function(obj) {
        // TODO recurseTimes?
        if (obj && typeof obj.toRepr == 'function') return obj.toRepr();
        return _inspect.apply(_util, arguments);
    };
    
    process.args = _process.argv;
	process.env = _process.env;
	
	// globals
	//process.global = global; // FIXME node inpsect bug
	// TODO this may not be wise
	
	// user/group info
	define(process, 'userId', {
	    get: function() { return _process.getuid() },
	    set: function(id) { _process.setuid(id) }
	});
	define(process, 'groupId', {
	    get: function() { return _process.getgid() },
	    set: function(id) { _process.setgid(id)}
	});
	
	// exit
	process.exit = _process.exit;
	
	// stats
	define(process, 'memory', {
	    get: function() { return _process.memoryUsage() }
	});
	
	// gc?
	
	// TODO should do something like exports to an object whos prototype is `process`?
}




// TODO set globals

// TODO attach window.onerror to on("error") if available
// TODO alias on("error") to on("unhandledException") for node

return process;
});
