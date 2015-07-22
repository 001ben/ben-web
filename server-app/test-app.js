var showJsonApi = require('./show-json-api');
var baseApp = require('./base-app');
var jsonFile = require('jsonfile');

showJsonApi.setCollection('testShows');

var mockData = jsonFile.readFileSync('./tests/mock-data/shows.json');

function resetShows(testShows) {
    return testShows.count()
        .then(function (count) {
            if (count)
                return testShows.drop();
            else
                return this;
        }).then(function () {
            return testShows.insertMany(mockData);
        });
}

function countShows(testShows) {
    return testShows.count();
}

function dbActionError(err) {
    console.log(err);
}

// Reset testShows on startup
showJsonApi.doDbAction(resetShows, null, dbActionError);

showJsonApi.api.get('/reset', function (req, res) {
    showJsonApi.doDbAction(resetShows, function () {
        res.end();
    }, dbActionError);
});

showJsonApi.api.get('/count', function (req, res) {
    showJsonApi.doDbAction(countShows, function (count) {
        res.json(count);
    }, dbActionError);
});

// Use this for testing
baseApp.port = 8080;
// Set up show api for data requests
baseApp.serverApp.use('/shows', showJsonApi.api);

baseApp.start();