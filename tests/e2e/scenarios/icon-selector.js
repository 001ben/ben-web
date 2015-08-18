'user strict';

var IconSelectorDialog = require('../pages/icon-selector-dialog.js');
var ShowDetails = require('../pages/show-details.js');
var ShowList = require('../pages/show-list.js');
var requestP = require('request-promise');


describe('icon selector', function () {

	var icons = new IconSelectorDialog();
	var details = new ShowDetails();
	var list = new ShowList();

	beforeEach(function () {
		browser.wait(requestP(browser.params.testUrl + '/shows/reset'));
		browser.refresh();
	});

	it('should open the icon selecting dialog on click', function () {
		icons.openDialog();
		expect(icons.dialog().isPresent()).toBeTruthy();
		expect(icons.dialog().isDisplayed()).toBeTruthy();
		icons.closeDialog();
		expect(icons.dialog().isPresent()).toBeFalsy();
	});

	it('should allow you to select an image and display it as an icon', function () {
		var initialUrl, newUrl;
		var testShowNo = 0;

		list.selectShow(testShowNo);

		browser.wait(details.showIcon().getCssValue('background-image')).then(function (initUrl) {
			initialUrl = initUrl;

			return icons.openDialog();
		}).then(function () {
			icons.selectImage(0);

			return browser.wait(icons.positionScreenShown(), 5000);
		}).then(function () {
			icons.acceptSelection();

			expect(details.showIcon().getCssValue('background-image')).not.toMatch(initialUrl);
			expect(list.showIconAt(testShowNo).getCssValue('background-image')).not.toMatch(initialUrl);

			return browser.wait(details.showIcon().getCssValue('background-image'));
		}).then(function (url) {
			newUrl = url;

			return icons.openDialog();
		}).then(function () {
			icons.selectImage(1);

			return browser.wait(icons.positionScreenShown(), 5000);
		}).then(function () {
			icons.acceptSelection();

			expect(details.showIcon().getCssValue('background-image')).not.toMatch(initialUrl);
			expect(details.showIcon().getCssValue('background-image')).not.toMatch(initialUrl);

			expect(list.showIconAt(testShowNo).getCssValue('background-image')).not.toMatch(newUrl);
			expect(list.showIconAt(testShowNo).getCssValue('background-image')).not.toMatch(newUrl);
		});
	});

	it('should allow you to cancel image selection with no changes made', function () {
		var initialUrl;

		list.selectShow(0);

		browser.wait(details.showIcon().getCssValue('background-image')).then(function (initUrl) {
			initialUrl = initUrl;
			return icons.openDialog();
		}).then(function () {
			icons.closeDialog();

			expect(details.showIcon().getCssValue('background-image')).toEqual(initialUrl);
			expect(list.showIconAt(0).getCssValue('background-image')).toEqual(initialUrl);

			return icons.openDialog();
		}).then(function () {
			icons.selectImage(0);

			return browser.wait(icons.positionScreenShown(), 5000);
		}).then(function () {
			icons.closeDialog();

			expect(details.showIcon().getCssValue('background-image')).toEqual(initialUrl);
			expect(list.showIconAt(0).getCssValue('background-image')).toEqual(initialUrl);
		});
	});

	it('should be able to images for all the listed shows', function () {
		list.count().then(function (count) {
			for (var index = 0; index < count; index++) {
				list.selectShow(index);
				var showUrl;

				browser.wait(details.showIcon().getCssValue('background-image')).then(function (url) {
					showUrl = url; 
					return browser.wait(icons.openDialog());
				}).then(function () {
					icons.selectImage(0);

					return browser.wait(icons.positionScreenShown(), 5000);
				}).then(function () {
					icons.acceptSelection();

					details.showIcon().getCssValue('background-image').then(function (url) {
						expect(url).not.toBe(showUrl);
					});
				});
			}
		});
	});
});