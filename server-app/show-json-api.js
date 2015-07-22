var mongo = require('mongodb');
var showModel = require('./models/shows-model');
var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');

var objectId = mongo.ObjectID;
var mongoUrl = 'mongodb://localhost:27017/shows';

var showJsonApi = express.Router();

/* Helpers */

var collection = 'shows';

function openDb() {
    return mongo.connect(mongoUrl);
}

function overrideCollection(collectionName) {
    collection = collectionName;
}

function getCollection(db) {
    return db.collection(collection);
}

/* API Logic */
showJsonApi.use('/', bodyParser.json());

/* Request Handling, the fun part */
showJsonApi.get('/', function (req, res) {

    doDatabaseAction(function (shows) {
        return shows.find().sort({
            modified: -1
        }).toArray();
    }, function (data) {
        res.json(data);
    }, function (err) {
        sendError(res, err);
    });
});

showJsonApi.post('/update/:id', function (req, res) {
    var id = req.params.id;
    var showObj;

    try {
        showObj = parseAndValidate(req.body);
    } catch (err) {
        sendValidationError(res, err);
        return;
    }

    doDatabaseAction(function (shows) {
            return shows.updateOne({
                _id: new objectId(id)
            }, {
                $set: extend(showObj, {
                    modified: new Date()
                })
            });
        }, function () {
            res.end();
        },
        function (err) {
            sendError(res, err);
        });
});

showJsonApi.post('/create', function (req, res) {
    var showObj;

    try {
        showObj = parseAndValidate(req.body);
    } catch (err) {
        sendValidationError(res, err);
        return;
    }

    doDatabaseAction(function (shows) {
            return shows.insertOne(extend(showObj, {
                modified: new Date()
            }));
        },
        function (result) {
            res.json(result.ops[0]._id);
        },
        function (err) {
            sendError(res, err);
        });
});

exports.setCollection = overrideCollection;
exports.doDbAction = doDatabaseAction;
exports.api = showJsonApi;

/* Internal methods (makes the code above prettier) */

/**
 * This is a dbOperationCallback and is used to execute operations on a mongodb collection.
 *
 * @callback databaseOperationCallback
 * @param {Collection} Mongo Collection to perform operations on
 * @returns {Promise}
 */
/**
 * The dbResponseCallback is used to process the result of a databaseOperationCallback
 *
 * @callback dbResponseCallback
 * @param {Object} Result of the databaseOperationCallback
 */
/**
 * The errorHandler callback is used to process errors for connecting, or the error of a databaseOperationCallback
 *
 * @callback errorHandler
 * @param {Object} Error object
 */

/**
 * Opens a database connection, performs an operation then handles the response.
 *
 * @param {dbOperationCallback} operationHandler - Should return the promise of the operation performed
 * @param {dbResponseCallback} responseHandler - Handles data returned by the operationHandler.
 * @param {errorHandler} errorHandler - Handles errors that occur at any level.
 */
function doDatabaseAction(operationHandler, responseHandler, errorHandler) {
    var db;
    openDb()
        .then(function (_db_) {
            db = _db_;
            var collection = getCollection(db);
            return !operationHandler ? this : operationHandler(collection);
        })
        .then(function (data) {
            db.close();
            if (responseHandler)
                responseHandler(data);
        })
        .catch(function (err) {
            db.close();
            if (errorHandler)
                errorHandler(err);
        });
}

/* Validation and Data Integrity */
function parseAndValidate(jsonShowObj) {
    jsonShowObj = showModel.parseFields(jsonShowObj);
    showModel.validateFields(jsonShowObj);
    return jsonShowObj;
}

/* Error Handling */
var defaultError = 'An error occurred while performing a database operation';

function appError(error, friendlyError) {
    error = error || defaultError;
    friendlyError = friendlyError || defaultErr;
    friendlyError = friendlyError === true ? error : '';

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