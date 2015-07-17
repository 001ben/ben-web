var mongo = require('mongoskin');

var mongoUrl = 'mongodb://localhost:27017/shows';

/* Core database interactions */
var shows = function () {
    var db = mongo.db(mongoUrl);
    db.bind('shows').bind({
        getAll: function (callback) {
            this.find().toArray(callback);
        },
        close: function () {
            db.close();
        }
    });
    return db.shows;
};

exports.openShows = shows;

/* Request Handling */
var handleErrors = function (callback) {
    return function (err, data) {
        if (err == null) {
            callback(data);
        } else {
            res.status(500).json({
                friendlyError: 'An error occurred while performing a database operation',
                error: err
            });
        }
    };
};

var showsHandler = {
    getAllHandler: function (req, res) {
        var db = shows();
        db.getAll(handleErrors(function (data) {
            res.json(data);
            db.close();
        }));
    }
};

exports.handler = showsHandler;