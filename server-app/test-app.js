var showJsonApi = require('./show-json-api');
var baseApp = require('./base-app');
var jsonFile = require('jsonfile');
var Show = require('./models/shows-model');
var everyauth = require('everyauth');

var mockData = jsonFile.readFileSync('./tests/mock-data/shows.json');

function resetShows(res) {
	Show.remove({}, function (err) {
		if (err) {
			console.log(err);
			if (res) res.end();
		} else {
			Show.create(mockData, function (err) {
				if (err) console.log(err);
				if (res) res.end();
			});
		}
	});
}

function countShows(res) {
	Show.count({}, function (err, count) {
		res.json(count);
	});
}

function dbActionError(err) {
	console.log(err);
}

// Reset testShows on startup
resetShows();
showJsonApi.api.get('/reset', function (req, res) {
	resetShows(res);
});

showJsonApi.api.get('/count', function (req, res) {
	countShows(res);
});

// Use this for testing
baseApp.port = 8080;
// Set up show api for data requests
baseApp.serverApp.use('/shows', showJsonApi.api);
showJsonApi.connect('testShows');
baseApp.initialise();
baseApp.start();