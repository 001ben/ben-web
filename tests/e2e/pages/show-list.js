var ShowList = function () {
	this.getShows = function () {
		return element.all(by.css('md-list-item'));
	};

	this.getShowNames = function() {
		return element.all(by.css('md-list-item button span')).getText();
	};

	this.loadAll = function () {
		browser.get('/#');
	};

	this.count = function () {
		return this.getShows().count();
	};

	this.showIconAt = function (index) {
		return element(by.css('md-list-item:nth-child(' + (index + 1) + ') .avatar-sidebar-image'));
	};

	this.selectShow = function (index) {
		this.getShows().get(index).click();
	};

	this.selectOrder = function(modelField) {
		element(by.model('ul.orderBy')).click();
		element(by.css('.order-by-option[value=' + modelField + ']')).click();
	};

	this.reverseOrder = function() {
		element(by.id('orderByAscending')).click();
	};
};

module.exports = ShowList;
