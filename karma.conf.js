module.exports = function (config) {
	config.set({

		basePath: './',

		files: [
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-animate/angular-animate.js',
			'app/bower_components/angular-aria/angular-aria.js',
			'app/bower_components/angular-messages/angular-messages.js',
            'app/bower_components/angular-material/angular-material.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
            
            'app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            
            'app/src/shows/shows.js',
            
            'app/src/**/*.js',
			'tests/unit/*.js',
            
            { pattern: 'tests/mock-data/*.json', watched: true, served: true, included: true }
		],

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['Chrome'],

		plugins: [
			'karma-chrome-launcher',
			'karma-jasmine',
			'karma-junit-reporter'
		],

		junitReporter: {
			outputFile: 'tests/unit.xml',
			suite: 'unit'
		}

	});
};