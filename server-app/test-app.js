var showJsonApi = require('./show-json-api');
var baseApp = require('./base-app');
var jsonFile = require('jsonfile');
var Show = require('./models/shows-model');

showJsonApi.setDbName('testShows');

var mockData = jsonFile.readFileSync('./tests/mock-data/shows.json');

function resetShows(res) {
	showJsonApi.openDb(function (end) {
		Show.remove({}, function (err) {
			if (err) {
				console.log(err);
				if(res) res.end();
				end();
			} else {
				Show.create(mockData, function (err) {
					if (err) console.log(err);
					if(res) res.end();
					end();
				});
			}
		});
	});
}

function countShows(res) {
	showJsonApi.openDb(function (end) {
		Show.count({}, function(err, count) {
			res.json(count);
			end();
		});
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
baseApp.initialise();
baseApp.start();