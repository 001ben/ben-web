var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var showsDb = require('./shows-db');

var publicDirectory = path.join(__dirname, "../app");
var imageDirectory = path.join(__dirname, "../app/assets/show-images");
var defaultPort = process.argv[2] || 8080;

var app = express();

// Instruct clients to cache images sent for 3 hours
app.use('/assets/show-images', express.static(imageDirectory, {
    maxage: '3h'
}));

// Accepts json requests for shows and sets up shows api handlers
app.use('/shows', bodyParser.json());
app.get('/shows', showsDb.getAllHandler);
app.post('/shows/update/:id', showsDb.updateHandler);
//app.get('/shows/test', showsDb.testHandler);

// Mount static middleware for all other requests
app.use(express.static(publicDirectory));

// Start out configured server
var server = app.listen(defaultPort, function () {
    console.log("public directory %s", publicDirectory);
    console.log("listening on port %s", defaultPort);
});