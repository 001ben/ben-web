var baseApp = require('./base-app');
var config = require('./config');
var express = require('express');
var expressSession = require('express-session');
var googleStrategy = require('passport-google-auth').Strategy;
var path = require('path');
var passport = require('passport');
var showJsonApi = require('./show-json-api');

var User = require('./models/user').model;

/*************************
 * Local Variables
 *************************/
var imageDirectory = path.join(__dirname, "../public/assets/show-images");
var loginRoute = '/login';
var allowedLoginRoutes = [
  '/dist/js/login',
  '/dist/css/login',
  '/maps',
  '/bower_components',
  '/assets',
  '/auth',
  loginRoute
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
passport.use(new googleStrategy({
  clientId: '339615721500-ned5uktcd2ani9c3ch0v52p393ub9ds1.apps.googleusercontent.com',
  clientSecret: 'gm1qhoI4miwWMTia0v86YZ_x',
  callbackURL: config.hostname + '/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
  User.findOne({
      googleId: profile.id
    })
    .exec()
    .then(function(user) {
      return user || User.create({
        googleId: profile.id,
        name: profile.name
      });
    }).onResolve(function(err, user) {
      done(err, user);
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done);
});

baseApp.serverApp
  .use(expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use('/shows', showJsonApi.api)
  .use(function(req, res, next) {
    if (!req.user && !isAllowedLoginPath(req.path)) {
      res.redirect('/login');
    } else if (req.user && req.path == loginRoute) {
      console.log('attempting to navigate to the login page when already logged in')
      res.redirect('/');
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

baseApp.serverApp.get('/auth/google', passport.authenticate('google', {
  scope: 'profile'
}));

baseApp.serverApp.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// baseApp.serverApp.get('/logout', function(req, res) {
//   req.logout();
//   res.redirect('/login');
// });

/*************************
 * Initialisation
 *************************/
showJsonApi.connect();
baseApp.initialise();
baseApp.start();
