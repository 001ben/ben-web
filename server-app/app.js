var showJsonApi = require('./show-json-api');
var express = require('express');
var baseApp = require('./base-app');
var path = require('path');

var imageDirectory = path.join(__dirname, "../public-app/assets/show-images");

// Instruct clients to cache images sent for 3 hours
baseApp.serverApp.use('/assets/show-images', express.static(imageDirectory, {
    maxage: '3h'
}));

// Set up show api for data requests
baseApp.serverApp.use('/shows', showJsonApi.api);

baseApp.initialise();
baseApp.start();