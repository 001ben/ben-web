var IconSelectorDialog = function () {
	
    this.closeDialog = function() {
        element(by.name('icon-select-close')).click();
    };
    
    this.openDialog = function() {
        element(by.id('test-button')).click();
    };
    
    this.dialog = function() {
        return element(by.tagName('md-dialog'));    
    }
    
    this.imageElements = function() {
        return element.all(by.css('md-dialog img'));
    };
    
    // returns image url
    this.selectImage = function(num) {
        var element, url;
        
        browser.wait(this.imageElements()).then(function(elements) {
            element = elements[num];
            
            return browser.wait(element.getAttribute());
        }).then(function(imageHref) {
            url = imageHref;
            
            element.click();
        });
        
        return url;
    };
    
    this.acceptSelection = function() {
        element(by.name('icon-select-accept')).click();
    };
};

module.exports = IconSelectorDialog;