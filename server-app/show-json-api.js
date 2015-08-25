var mongoose = require('mongoose');
var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');

var Show = require('./models/shows-model');
var ShowImage = require('./models/show-image-model').model;

var showJsonApi = express.Router();

/* connection details */
var mongoUrl = 'mongodb://localhost:27017/';
var dbName = 'shows';

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

function openDb(cb) {
	mongoose.connection.once('open', function () {
		cb(function () {
			mongoose.connection.close();
		});
	});

	mongoose.connect(mongoUrl + dbName);
}

function overrideDbName(overrideDbName) {
	dbName = overrideDbName;
}

/* API Logic */
showJsonApi.use('/', bodyParser.json());

/* Request Handling, the fun part */
showJsonApi.get('/', function (req, res) {
	openDb(function (end) {
		Show.find()
			.sort('-modified')
			.exec(function (err, data) {
				if (err != null) {
					sendError(res, err);
				} else {
					res.json(data);
				}
				end();
			});
	});
});

showJsonApi.post('/update/:id', function (req, res) {
	openDb(function (end) {
		Show.findById(req.params.id, function (err, s) {
			if (err) {
				sendError(res, err);
				end();
			} else {
				s.update(req.body, {
					runValidators: true
				}, function (err) {
					if (err) {
						sendError(res, err);
					} else {
						res.end();
					}
					end();
				});
			}
		});
	});
});

showJsonApi.post('/image/:id', function (req, res) {
	var image = new ShowImage(req.body);
	image.validate(function (err) {
		if (err) sendError(res, err);
		else {
			image = processImage(image);

			openDb(function (end) {
				Show.findById(req.params.id, function (err, doc) {
					if (err) {
						sendError(res, err);
						end();
					} else {
						doc.image = [image];
						doc.save(function (err) {
							if (err) sendError(res, err);
							else {
								res.json([image]);
							}
							end();
						});
					}
				});
			});
		}
	});
});

showJsonApi.post('/create', function (req, res) {
	openDb(function (end) {
		new Show(req.body).save(function (err, s) {
			if (err != null) {
				sendError(res, err);
			} else {
				res.json(s._id);
			}
			end();
		});
	});
});

exports.setDbName = overrideDbName;
exports.openDb = openDb;
exports.api = showJsonApi;

// for testing
//var app = express();
//app.use('/', showJsonApi);
//app.listen(8787);

/* Image processing */
function processImage(styleObject) {
	return styleObject;
}

/* Error Handling */
var defaultError = 'An error occurred while performing a database operation';

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

function sendError(res, err, friendlyErr) {
	res.status(500).json(appError(err, friendlyErr));
}

function sendValidationError(res, error) {
	res.status(500).json(validationError(error));
}