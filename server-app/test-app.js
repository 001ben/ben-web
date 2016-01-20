var showJsonApi = require('./show-json-api');
var baseApp = require('./base-app');
var jsonFile = require('jsonfile');
var Show = require('./models/shows-model');
var config = require('./config');
var extend = require('extend');

var mockShows = jsonFile.readFileSync('./tests/mock-data/shows.json');
var mockUser = jsonFile.readFileSync('./tests/mock-data/user.json');

var authenticateWithDefault = true;

function setLoggedIn(value) {
  authenticateWithDefault = value;
}

function resetData(res) {
  Show.remove({}).exec()
    .then(function() {
      return User.remove({}).exec();
    })
    .then(function() {
      return User.create(mockUser);
    })
    .then(function(user) {
      var newShows = [];
      var extendWith = {
        user: user[0]._id
      };
      for (var i in mockShows) {
        var newShow = extend({}, mockShows[i], extendWith);
        delete newShow._id;
        newShows.push(newShow);
      }
      return Show.create(newShows);
    })
    .then(null, console.log)
    .then(function() {
      res.end();
    });
}

function countShows(res) {
  Show.count({}).exec().then(function(count) {
    res.json(count);
  });
}

// Reset testShows on startup
resetData();
showJsonApi.api.get('/reset', function(req, res) {
  resetData(res);
});

showJsonApi.api.get('/count', function(req, res) {
  countShows(res);
});

// Use this for testing
config.port = 8080;

// Set up show api for data requests
baseApp.serverApp
  .use(function(req, res, next) {
    if (authenticateWithDefault === true) {
      User.findOne({
          googleId: '123456789123456789123'
        }).exec()
        .then(function(user) {
          req.user = user;
        }, console.log)
        .then(function() {
          next();
        });
    } else {
      next();
    }
  })
  .use('/shows', showJsonApi.api);

showJsonApi.connect('testShows');
baseApp.initialise();
baseApp.start();
