var express = require('express');
var path = require('path');
var config = require('./config');

var publicDirectory = path.join(__dirname, "../public");

var app = express();

exports.initialise = function () {
	// Mount static middleware for all other requests
	app.use(express.static(publicDirectory));
};

exports.publicDir = publicDirectory;
exports.serverApp = app;
exports.start = function () {

	// Start the configured server
	app.listen(config.port, function () {
		console.log("public directory %s", publicDirectory);
		console.log("listening on port %s", config.port);
	});
};
