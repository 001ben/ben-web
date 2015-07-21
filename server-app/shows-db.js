var mongo = require('mongodb');
var showModel = require('./models/shows-model');
var extend = require('extend');

//var stringifySafe = require('json-stringify-safe');

var objectId = mongo.ObjectID;
var mongoUrl = 'mongodb://localhost:27017/shows';

/* Helpers */
function openDb() {
    return mongo.connect(mongoUrl);
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

/* Request Handling */
var showsHandler = {
    getAllHandler: function (req, res) {
        var db;
        openDb()
            .then(function (_db_) {
                db = _db_;
                return db.collection('shows').find().sort({
                    modified: -1
                }).toArray();
            })
            .then(function (data) {
                db.close();
                res.json(data);
            })
            .catch(function (err) {
                sendError(res, err);
                db.close();
            });
    },
    updateHandler: function (req, res) {
        var id = req.params.id;
        var showObj = req.body;

        try {
            showObj = showModel.parseFields(showObj);
            showModel.validateFields(showObj);
        } catch (err) {
            sendValidationError(res, err);
            return;
        }

        var db;
        openDb()
            .then(function (_db_) {
                db = _db_;

                return db.collection('shows').updateOne({
                    _id: new objectId(id)
                }, {
                    $set: extend(showObj, {
                        modified: new Date()
                    })
                });
            })
            .then(function (data) {
                db.close();
                res.end();
            })
            .catch(function (err) {
                db.close();
                sendError(res, err);
            });
    }
//    ,
//    testHandler: function (req, res) {
//        var a = {
//            a: 1
//        };
//        var b = {
//            b: 2
//        };
//        res.end(stringifySafe(extend(a, b)));
//    }
};

module.exports = showsHandler;