var mongoose = require('mongoose');

var showImageSchema = new mongoose.Schema({
	'background-image': {
		type: String,
		required: true
	},
	'background-size': String,
	'background-position': String,
	'background-repeat': String,
	'border-radius': String,
	height: String,
	width: String,
	top: String,
	left: String,
	position: String
});

module.exports.schema = showImageSchema;
module.exports.model = mongoose.model('ShowImage', showImageSchema);