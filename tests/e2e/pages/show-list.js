var ShowList = function () {
	this.getShows = function () {
		return element.all(by.css('md-list-item'));
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
};

module.exports = ShowList;