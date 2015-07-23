module.exports = function (config) {
	config.set({

		basePath: './',

		files: [
			'public-app/bower_components/angular/angular.js',
			'public-app/bower_components/angular-animate/angular-animate.js',
			'public-app/bower_components/angular-aria/angular-aria.js',
			'public-app/bower_components/angular-messages/angular-messages.js',
            'public-app/bower_components/angular-material/angular-material.js',
			'public-app/bower_components/angular-mocks/angular-mocks.js',
            
            'public-app/bower_components/jquery/dist/jquery.js',
            'public-app/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            
            'public-app/js/shows.min.js',
            
            'public-app/js/*.js',
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