var mongoose = require('mongoose');
var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');

var Show = require('./models/shows-model');
var ShowImage = require('./models/show-image-model').model;
var objectId = mongoose.Types.ObjectId;

var showJsonApi = express.Router();

/* connection details */
var mongoUrl = 'mongodb://localhost:27017/';
var dbName = 'shows';

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('database connection opened at ' + mongoUrl + dbName);
});

/* API Logic */
showJsonApi
  .use('/', bodyParser.json())
  .use(function(req, res, next) {
    if (!req.user) sendAuthError(res);
    else next();
  });

/* Request Handling, the fun part */
showJsonApi.get('/', function(req, res) {
  Show.find({
      user: req.user._id
    })
    .sort('-modified')
    .exec()
    .then(function(shows) {
        res.json(shows);
      },
      function(err) {
        sendAppError(res, err);
      });
});

showJsonApi.post('/update/:id', function(req, res) {
  Show.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    .exec().then(function(show) {
      console.log(show);

      if (!show) throw validationError({
        message: 'The given id did not match any records'
      });
      else return show;
    }).then(function(show) {
      delete req.body.user;
      delete image;
      return show.update(req.body, {
        runValidators: true
      }).exec();
    }).then(
      function() {
        res.end();
      },
      function(err) {
        sendAppError(res, err);
      });
});

showJsonApi.post('/image/:id', function(req, res) {
  var image = new ShowImage(req.body);
  image.validate().then(function() {
    image = processImage(image);
    return Show.findOne({
      _id: req.params.id,
      user: req.user._id
    }).exec();
  }).then(function(data) {
    if (!data) throw validationError({
      message: 'The given id did not match any records'
    });
    else return data;
  }).then(function(show) {
    show.image = [image];
    return show.save();
  }).then(
    function() {
      res.json([image]);
    },
    function(err) {
      sendAppError(res, err);
    });
});

showJsonApi.post('/create', function(req, res) {
  req.body.user = req.user._id;
  new Show(req.body)
    .save()
    .then(function(show) {
      res.json(show._id);
    }, function(err) {
      sendAppError(res, err);
    });
});

exports.api = showJsonApi;
exports.connect = function(overrideDbName) {
  mongoose.connect(mongoUrl + (dbName = (overrideDbName || dbName)));
};

// var app = express();
// app.use('/', showJsonApi);
// app.listen(8787);
// console.log('listening');

/* Image processing */
function processImage(styleObject) {
  return styleObject;
}

/* Error Handling */
var defaultError = 'An error occurred while performing a database operation';
var defaultAuthError = 'you are not authorized to access this resource, please re-authenticate';

function sendError(res, code, errorObj) {
  res.status(code).json(errorObj);
}

function sendAppError(res, err, friendlyErr) {
  sendError(res, 500, appError(err, friendlyErr));
}

function sendValidationError(res, error) {
  sendError(res, 500, validationError(error));
}

function sendAuthError(res) {
  sendError(res, 401, defaultAuthError, defaultAuthError);
}

function appError(error, friendlyError) {
  error = error || defaultError;
  friendlyError = friendlyError || defaultError;

  return {
    error: error,
    friendlyError: friendlyError
  };
}

function validationError(error) {
  return extend(error, {
    validationFailed: true
  });
}
