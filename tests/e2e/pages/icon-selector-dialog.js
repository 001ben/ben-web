var IconSelectorDialog = function () {

	this.closeDialog = function () {
		element(by.name('icon-select-close')).click();
	};

	this.openDialog = function () {
		element(by.className('add-image')).click();
	};

	this.dialog = function () {
		return element(by.tagName('md-dialog'));
	};

	this.imageElements = function () {
		return element.all(by.css('#icon-select-search img.gs-image'));
	};

	// returns image url
	this.selectImage = function (num) {
		browser.wait(this.imageElements()).then(function (elements) {
			elements[num].click();
		});
	};

	this.acceptSelection = function () {
		element(by.id('icon-select-accept')).click();
	};
};

module.exports = IconSelectorDialog;