var mongoose = require('mongoose');
var showImageSchema = require('./show-image-model').schema;

// Defining schema using showImage object
var showSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	notes: String,
	episodes: Number,
	next: String,
	filmType: String,
	seasons: Number,
	seasonEpisodes: Number,
	watched: Boolean,
	image: [showImageSchema],
	modified: Date
});

showSchema.pre('update', function () {
	this.update({}, {
		$set: {
			modified: new Date()
		}
	});
});

showSchema.pre('save', function (next) {
	this.modified = new Date();
	next();
});

module.exports = mongoose.model('Show', showSchema);