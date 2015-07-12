var ShowDetails = function () {
	this.load = function () {
		browser.get('/#');
	};
    
    this.currentShowName = function() {
        return element(by.binding('ul.selected.name')).getText();
    };
};

module.exports = ShowDetails;