var testUrl =  'http://localhost:8080';

exports.config = {
	allScriptsTimeout: 11000,

	specs: [
		'./**/*.js'
	],
    
    suites: {
        experiment: './experiment/my_exp.js',
        full: './scenarios/shows.js'
    },

	capabilities: {
		'browserName': 'chrome'
	},
    
    params: {
        testUrl: testUrl
    },

	baseUrl: testUrl,

	seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

	framework: 'jasmine',

	plugins: [{
		chromeA11YDevTools: true,
		path: '../../node_modules/protractor/plugins/accessibility/index.js'
	}],

	jasmineNodeOpts: {
		defaultTimeoutInterval: 30000
	}
};