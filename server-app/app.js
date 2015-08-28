var showJsonApi = require('./show-json-api');
var express = require('express');
var baseApp = require('./base-app');
var path = require('path');
var mongooseAuth = require('mongoose-auth');
var expressSession = require('express-session');

var User = require('./models/user').model;

/*************************
 * Local Variables
 *************************/
var imageDirectory = path.join(__dirname, "../public/assets/show-images");
var appSecret = 'ben express session secret';
var allowedLoginRoutes = [
	'/dist/js/login',
	'/dist/css/login',
	'/maps',
	'/bower_components',
	'/assets/png/Blue_signin_Medium',
	'/login'
];

/*************************
 * Local Methods
 *************************/
function isAllowedLoginPath(path) {
	for (var i in allowedLoginRoutes) {
		if (path.indexOf(allowedLoginRoutes[i]) === 0) {
			return true;
		}
	}
	return false;
}

/*************************
 * MiddleWare
 *************************/
baseApp.serverApp
	.use(expressSession({
		resave: false,
		secret: appSecret,
		saveUninitialized: false
	}))
	.use(mongooseAuth.middleware())
	.use(function(req, res, next) {
		if (!req.loggedIn && !isAllowedLoginPath(req.path)) {
			res.redirect('/login');
		} else {
			next();
		}
	})
	.use('/assets/show-images', express.static(imageDirectory, {
		maxage: '3h'
	}));

/*************************
 * Routing
 *************************/
baseApp.serverApp.get('/login', function(req, res) {
	var file = baseApp.publicDir + '\\html\\login.html';
	res.type('html');
	res.status(200).sendFile(file);
});

baseApp.serverApp.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});

/*************************
 * Initialisation
 *************************/
baseApp.serverApp.use('/shows', showJsonApi.api);
showJsonApi.connect();
baseApp.initialise();
baseApp.start();
