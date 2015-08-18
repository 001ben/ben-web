var IconSelectorDialog = function () {

	this.closeDialog = function () {
		element(by.id('icon-select-close')).click();
		expect(this.dialog().isPresent()).toBeFalsy();
	};

	this.openDialog = function () {
		var icons = this;
		browser.actions().mouseMove(element(by.className('avatar-image'))).perform();
		element(by.className('add-image')).click();
		expect(icons.dialog().isPresent()).toBeTruthy();
		expect(icons.dialog().isDisplayed()).toBeTruthy();
				
		return browser.wait(function() {
			var deferred = protractor.promise.defer();
			function returnIfExists() {
				icons.imageElements().count().then(function(count) {
					if (count > 0)
						deferred.fulfill(true);
					else
						returnIfExists();
				});
			}
			returnIfExists();
			
			return deferred.promise;
		});
	};

	this.dialog = function () {
		return element(by.tagName('md-dialog'));
	};

	this.imageElements = function () {
		return element.all(by.css('#icon-select-search .gs-image-thumbnail-box img.gs-image'));
	};
	
	this.positionScreenShown = function() {
		return function() {
			var deferred = protractor.promise.defer();
			function returnIfExists() {
				element(by.id('icon-select-position')).isDisplayed().then(function(present) {
					if (present)
						deferred.fulfill(true);
					else
						returnIfExists();
				});
			}
			returnIfExists();
			
			return deferred.promise;
		};
	};

	// returns image url
	this.selectImage = function (num) {
		var e = this.imageElements().get(num);
		browser.actions().mouseMove(e).perform();
		
		e.click();
	};

	this.acceptSelection = function () {
		element(by.id('icon-select-accept')).click();
	};
};

module.exports = IconSelectorDialog;