var mongoose = require('mongoose');
var mongooseAuth = require('mongoose-auth');

var userSchema = new mongoose.Schema({}),
	User;

userSchema.plugin(mongooseAuth, {
	everymodule: {
		everyauth: {
			User: function () {
				return User;
			},
			findUserById: function(userId, fn) {
				User.findById(userId, fn);
			}
		}
	},
	google: {
		everyauth: {
			myHostname: 'http://localhost',
			appId: '339615721500-ned5uktcd2ani9c3ch0v52p393ub9ds1.apps.googleusercontent.com',
			appSecret: 'gm1qhoI4miwWMTia0v86YZ_x',
			redirectPath: '/',
			scope: 'profile'
		}
	}
});

mongoose.model('User', userSchema);

User = mongoose.model('User');

module.exports.schema = userSchema;
module.exports.model = User;