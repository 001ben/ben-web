var ShowList = function () {
	var getShows = function() {
        return element.all(by.css('md-list-item'));
    };
    
    this.loadAll = function () {
		browser.get('/#');
	};
    
	this.count = function () {
        return getShows().count();
	};
    
    this.showIconAt = function(index) {
        return element(by.css('md-list:nth-child(' + (index + 1) + ') .avatar-sidebar-container div'));
    };
    
    this.selectShow = function(index) {
        getShows().then(function(elements) {
            elements[index].click();
        });
    };
};

module.exports = ShowList;