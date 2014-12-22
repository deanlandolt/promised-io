// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define([ 'intern' ], function (intern) {
	var args = intern.args;

	var proxyPort = Number(args.proxyPort) || 9000;
	var proxyHost = args.proxyHost || 'localhost';

	var environments;
	switch (args.env) {
	case 'ie':
		environments = [ { browserName: 'internet explorer' } ];
		break;
	case 'chrome':
		environments = [ { browserName: 'chrome', chromeOptions: { 'args': [ '--test-type' ] } } ];
		break;
	case 'phantom':
		environments = [ { browserName: 'phantomjs' } ];
		break;
	case 'ff':
		environments = [ { browserName: 'firefox' } ];
		break;
	default:
		environments = [
			{ browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
			{ browserName: 'firefox', version: '', platform: [ 'OS X 10.6', 'Windows 7' ] },
			{ browserName: 'chrome', version: '' }
		];
	}

	return {
		// The port on which the instrumenting proxy will listen
		proxyPort: proxyPort,

		// A fully qualified URL to the Intern proxy
		proxyUrl: 'http://' + proxyHost + ':' + proxyPort + '/',

		// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
		// specified browser environments in the `environments` array below as well. See
		// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
		// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
		// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
		// automatically
		capabilities: {
			'selenium-version': '2.44.0'
		},

		// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
		// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
		// capabilities options specified for an environment will be copied as-is
		environments: environments,

		// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
		maxConcurrency: 3,

		// Name of the tunnel class to use for WebDriver tests
		tunnel: args.tunnel || 'NullTunnel',

		// Configuration options for the module loader; any AMD configuration options supported by the specified AMD
		// loader can be used here
		loader: {
			// Packages that should be registered with the loader in each testing environment
			packages: [
				{ name: 'promised-io', location: '.' }
			]
		},

		// Non-functional test suite(s) to run in each browser
		suites: [ 'tests/unit/all' ],

		// A regular expression matching URLs to files that should not be included in code coverage analysis
		excludeInstrumentation: /^(?:tests|node_modules)\//
	};
});
