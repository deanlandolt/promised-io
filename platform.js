({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define([], function () {
	// node-like
	if (typeof process !== 'undefined' && process.argv) {
		return {
			type: 'node',
			args: process.argv,
			env: process.env,
			global: global,
			print: console.log.apply(console, arguments),
			require: require.nodeRequire || require
		};
	}

	// rhino-like
	if (typeof java === 'function' && typeof global === 'function' && global.name === 'global') {
		// no system module in vanilla rhino
		var system = {};
		try {
			system = require('system');
		}
		catch (e) {}
		return {
			type: 'rhino',
			args: system.args || [],
			env: system.env || {},
			global: global(),
			print: print,
			require: require
		};
	}

	// amd/browser-like
	if (typeof define === 'function' && typeof require === 'function') {
		return {
			type: 'browser',
			args: [],
			env: {},
			global: window,
			print: console.log.apply(console, arguments),
			require: require,
		};
	}
});
