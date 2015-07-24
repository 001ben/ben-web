var express = require('express');
var path = require('path');

var publicDirectory = path.join(__dirname, "../public-app");

// Now defaults to port 80
exports.port = process.argv[2] || 80;

var app = express();

exports.initialise = function() {
    // Mount static middleware for all other requests
    app.use(express.static(publicDirectory));
};

exports.serverApp = app;
exports.start = function () {
    
    // Start the configured server
    var server = app.listen(exports.port, function () {
        console.log("public directory %s", publicDirectory);
        console.log("listening on port %s", exports.port);
    });
};
