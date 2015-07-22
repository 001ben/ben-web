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
    
    this.selectShow = function(index) {
        getShows().then(function(elements) {
            elements[index].click();
        });
    }
};

module.exports = ShowList;