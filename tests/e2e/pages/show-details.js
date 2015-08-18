var ShowDetails = function () {
	this.load = function () {
		browser.get('/#');
	};
    
    this.showName = function() {
        return element(by.model('ul.selected.name')).getText();
    };
    
    this.showIcon = function() {
        return element(by.className('avatar-image'));
    };
    
    this.showForm = function() {
        return element(by.name('ul.showForm'));
    };
    
    this.addButton = function() {
        return element(by.id('add-button'));
    };
    
    this.getModelField = function(fieldModelPropertyName) {
        return element(by.model(fieldModelPropertyName));
    };
};

module.exports = ShowDetails;