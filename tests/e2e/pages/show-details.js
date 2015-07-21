var ShowDetails = function () {
	this.load = function () {
		browser.get('/#');
	};
    
    this.currentShowName = function() {
        return element(by.model('ul.selected.name')).getText();
    };
    
    this.getField = function(fieldBindingPropertyName) {
        return element();
    };
};

module.exports = ShowDetails;