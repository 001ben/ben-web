var helpers = function () {
	this.printAllElements = function (items) {
		console.log('in the method');
		items.forEach(function (e) {
			console.log('printing out element');
			e.getOuterHtml().then(console.log);
		});
	};
};

module.exports = helpers;