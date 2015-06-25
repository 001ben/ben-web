var express = require('express');
var path = require('path');

var publicDirectory = path.join(__dirname, "../app");
var defaultPort = process.argv[2] || 8080;

console.log(publicDirectory);

var app = express();

app.use(express.static(publicDirectory));

var server = app.listen(defaultPort, function() {
	console.log("public directory %s", publicDirectory);
	console.log("listening on port %s", defaultPort);
});