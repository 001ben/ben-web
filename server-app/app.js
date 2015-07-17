var express = require('express');
var path = require('path');
var showsDb = require('./shows-db');

var publicDirectory = path.join(__dirname, "../app");
var imageDirectory = path.join(__dirname, "../app/assets/show-images");
var defaultPort = process.argv[2] || 8080;

var app = express();

app.use('/assets/show-images', express.static(imageDirectory, {
    maxage: '3h'
}));
app.get('/shows', showsDb.handler.getAllHandler);
app.use(express.static(publicDirectory));

var server = app.listen(defaultPort, function () {
    console.log("public directory %s", publicDirectory);
    console.log("listening on port %s", defaultPort);
});