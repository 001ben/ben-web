module.exports = function (config) {
	config.set({

		basePath: './',

		files: [
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-animate/angular-animate.js',
			'app/bower_components/angular-aria/angular-aria.js',
			'app/bower_components/angular-material/angular-material.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
            
            'app/src/shows/Shows.js',
            
            'app/src/**/*.js',
			'karma-tests/*.js'
		],

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['Chrome'],

		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-jasmine',
			'karma-junit-reporter'
		],

		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};