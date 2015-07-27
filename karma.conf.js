module.exports = function (config) {
	config.set({

		basePath: './',

		files: [
			'public/bower_components/angular/angular.js',
			'public/bower_components/angular-animate/angular-animate.js',
			'public/bower_components/angular-aria/angular-aria.js',
			'public/bower_components/angular-messages/angular-messages.js',
			'public/bower_components/angular-material/angular-material.js',
			'public/bower_components/angular-mocks/angular-mocks.js',
            
			'public/bower_components/jquery/dist/jquery.js',
			'public/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            
			'public/dist/js/**/*.js',
            
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