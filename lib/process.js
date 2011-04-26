({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory.apply(this, deps.map(require))}}).
define(["./promise"], function(promise){

var defer = promise.defer;
var when = promise.when;

// detect environment

var _system, _process, nodeLike, commonjsLike, browserLike;
if (typeof process != "undefined") {
    _process = process;
    nodeLike = true;
}
try {
    _system = require('' + 'system'); // bypass static analysis
    commonjsLike = true;
}
catch (e) {
}
if (typeof navigator != 'undefined' && typeof location != 'undefined') {
    browserLike = true;
}


// sniff runtime and engine
// tests are ordered by (perceived) specificity (but this could use more eyes)

(function sniffEnvironment() {
    if (commonjsLike && typeof _system.platform === 'string') {
        if (_system.platform.indexOf('flusspferd') >= 0) {
            exports.runtime = 'flusspferd';
            exports.engine = 'spidermonkey';
            return;
        }
        if (_system.platform.indexOf('gpsee') >= 0) {
            exports.runtime = 'gpsee';
            exports.engine = 'spidermonkey'; // FIXME tracemonkey? yaegermonkey?
            return;
        }
    }
    if (nodeLike && _process.versions && _process.versions.node) {
        if (_process.versions) {
            if (_process.versions.node) exports.runtime = 'node';
            if (_process.versions.v8) exports.engine = 'v8';
            return;
        }
    }
    if (typeof Packages !== 'undefined' && Packages.java) {
        exports.engine = 'rhino';
    }
    if (commonjsLike) {
        if (_system.engine) {
            exports.engine = _system.engine;
        }
        if (exports.engine === 'rhino' && Packages.java.lang.System.getProperty('ringo.home')) {
            exports.runtime = 'ringo';
            return;
        }
        if (_system.env.NARWHAL_HOME) {
            exports.runtime = 'narwhal';
            return;
        }
        // TODO gpsee? flusspferd?
    }
    if (browserLike) {
        exports.runtime = 'browser';
        // TODO sniff engine?
        return;
    }
    exports.runtime = 'default';
})();


// TODO rhino:
// String(Packages.java.lang.System.getProperty("user.dir"));

// java.runtime.name: 'Java(TM) SE Runtime Environment'
// java.runtime.version: '1.6.0_22-b04-307-10M3261'
// java.version: '1.6.0_22'
// java.vendor: 'Apple Inc.'
// java.vm.info: 'mixed mode'
// java.vm.name: 'Java HotSpot(TM) 64-Bit Server VM'
// java.vm.version: '17.1-b03-307'
// java.vm.vendor: 'Apple Inc.'
// java.io.tmpdir

// path.separator: ':'
// line.separator: '\n'
// file.separator: '/'
// file.encoding: 'MacRoman'
// sun.jnu.encoding ?

// user.country
// user.dir
// user.home
// user.name
// user.timezone
// user.language

// os.arch 'x86_64'
// os.name 'Mac OS X'
// os.version '10.6.6'
// sun.os.patch.level: 'unknown'
// sun.cpu.endian: 'little'
// sun.io.unicode.encoding: 'UnicodeLittle'
// sun.arch.data.model: 64

//node: os.type: 'Darwin'


// FIXME it would be best to just do the browser work here
// we can move the node/commonjs code to platform modules


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
exports.stdin = {
    read: function() {} // TODO
};
exports.stdout = {
    write: writeOut
};
exports.stderr = {
    write: writeErr
};


// stdout helpers

exports.FIELD_SEP = ' ';
exports.RECORD_SEP = '\n'; // TODO get from env
function formatLine(args, fieldSep, recordSep) {
    fieldSep = fieldSep != null ? fieldSep : exports.FIELD_SEP;
    recordSep = recordSep != null ? recordSep : exports.RECORD_SEP
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
exports.print = bindWriteLine(' ');
exports.puts = bindWriteLine('\n');


function defProp(obj, prop, desc) {
    if (desc.enumerable == null) desc.enumerable = true;
    if (desc.configurable == null) desc.configurable = true;
    Object.defineProperty(obj, prop, desc);
}


if (browserLike) {
    exports.args = [location.pathname, location.search, location.hash].filter(function(arg) {
        return arg;
    });
    // exports.env = ??? navigator?
    
    // globals
    exports.global = window;
    
    // exit
    // should we tie into a window close hook?
}


if (commonjsLike) {
	exports.args = _system.args;
	exports.env = _system.env;
	
	if (engine === 'rhino') {
	    var keyIterator, key;
        // reset the env key and fetch them anew
    	exports.env = {};
        var env = Packages.java.lang.System.getenv();
        keyIterator = env.keySet().iterator();
        while (keyIterator.hasNext()) {
            key = keyIterator.next();
            exports.env[String(key)] = String(env.get(key));
        }
        
        // put properties in a separate object
        // TODO where should these really go? is there a correlary in node?
        exports.property = {};
        var properties = Packages.java.lang.System.getProperties();
        keyIterator = properties.keySet().iterator();
        while (keyIterator.hasNext()) {
            key = keyIterator.next();
            exports.property[String(key)] = String(properties.getProperty(key));
        }
	    
	    
	    var cLib;
        var getCLib = function() {
            var jna = Packages.com.sun.jna;
            cLib = jna.NativeLibrary.getInstance(
                jna.Platform.isWindows() ? "msvcrt" : "c"
            );
            getCLib = function () {
                return cLib;
            };
            return cLib;
        };
        
	    def(exports, 'id', {
    	    get: function() {
        	    // FIXME sun jvm specific -- write a jni fallback?
        	    var getRuntime = Packages.java.lang.management.ManagementFactory.getRuntimeMXBean
    	        if (typeof getRuntime  === 'function') {
            	    var name = getRuntime().getName();
            	    return Number(name.split('@')[0]);
        	    }
        	    return NaN;
    	    }
    	});
        
        defProp(exports, 'directory', {
            get: function () {
                var jna = Packages.com.sun.jna;
                var cwd = getCLib().getFunction("getcwd");
                var size = 4097;
                var memory = jna.Memory(size);
                var pointer = cwd.invokeInt([memory, size]);
                if (!pointer)
                    throw new Error("Could not get working directory: getcwd");
                return memory.getString(0, false);
            },
            set: function (path) {
                path = String(path);
                var error = getCLib().getFunction("chdir").invokeInt([path]);
                if (error)
                    throw new Error("Could not change working directory: " + path);
            }
        });
        
	}
	
	// globals
	if (_system.global) {
	    // narwhal
	    exports.global = _system.global;
	}
	else if (typeof global != 'undefined') {
	    // ringo
	    exports.global = global;
	}
	
	// exit
	exports.exit = require('' + 'os').exit;
}


if (nodeLike) {
    
    // patch util.inspect to respect toRepr function
    var _util = require('' + 'util');
    var _inspect = _util.inspect;
    _util.inspect = function(obj) {
        // TODO recurseTimes?
        if (obj && typeof obj.toRepr === 'function') return obj.toRepr();
        return _inspect.apply(_util, arguments);
    };
    
    exports.args = _process.argv;
	exports.env = _process.env;
	exports.id = _process.pid;
	
	defProp(exports, 'directory', {
	    get: function() {
	        return _process.cwd();
	    },
	    set: function(path) {
	        // TODO promisify?
	        _process.chdir(path);
	    }
	});
	
	// globals
	//exports.global = global; // FIXME node inpsect bug
	// TODO this may be unwise
	
	// user/group info
	exports.user = {};
	defProp(exports.user, 'id', {
	        get: function() { return _process.getuid() },
    	    set: function(id) { _process.setuid(id)}
	});
	exports.group = {};
	defProp(exports.group, 'id', {
	    get: function() { return _process.getgid() },
	    set: function(id) { _process.setgid(id)}
	});
	
	// exit
	exports.exit = _process.exit;
	
	// stats
	defProp(exports, 'memory', {
	    get: function() { return _process.memoryUsage() }
	});
	defProp(exports, 'uptime', {
	    get: function() { return _process.uptime() }
	});
	
	
	// gc?
	
	// TODO should do something like exports to an object whos prototype is `process`?
}




// TODO set globals

// TODO attach window.onerror to on("error") if available
// TODO alias on("error") to on("unhandledException") for node

return exports;
});
