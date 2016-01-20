var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  googleId: String,
  name: {
    givenName: String,
    familyName: String,
    middleName: String
  },
  showsOrderedBy: String,
  showsOrderedAscending: Boolean
});

mongoose.model('User', userSchema);
User = mongoose.model('User');

module.exports.schema = userSchema;
module.exports.model = User;
