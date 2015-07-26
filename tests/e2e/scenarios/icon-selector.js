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
    });

    it('should open the icon selecting dialog on click', function () {
        icons.openDialog();
        expect(icons.dialog().isPresent()).toBeTruthy();
        expect(icons.dialog().isDisplayed()).toBeTruthy();
        icons.closeDialog();
        expect(icons.dialog().isPresent()).toBeFalsy();
    });

    it('should allow you to select an image and display it as an icon', function () {
        icons.openDialog();
        expect(icons.imageElements().count()).toBeGreaterThan(0);
        var url = icons.selectImage(0);
        icons.acceptSelection();
        expect(details.showIcon.getCssValue('background-image')).toMatch(url);
        expect(list.showIconAt(0).getCssValue('background-image')).toMatch(url);
    });

    it('should allow you to cancel image selection with no changes made', function () {
        list.selectShow(0);
        browser.wait(details.showIcon().getCssValue('background-image')).then(function (initialUrl) {
            icons.openDialog();
            expect(icons.dialog().isPresent()).toBeTruthy();
            expect(icons.dialog().isDisplayed()).toBeTruthy();
            expect(icons.imageElements().count()).toBeGreaterThan(0);
            
            icons.closeDialog();
            expect(icons.dialog().isPresent()).toBeFalsy();
            expect(details.showIcon().getCssValue('background-image')).toEqual(initialUrl);
            expect(list.showIconAt(0).getCssValue('background-image')).toEqual(initialUrl);
            
            icons.openDialog();
            expect(icons.dialog().isPresent()).toBeTruthy();
            expect(icons.dialog().isDisplayed()).toBeTruthy();
            expect(icons.imageElements().count()).toBeGreaterThan(0);
            
            icons.selectImage(0);
            icons.closeDialog();
            expect(icons.dialog().isPresent()).toBeFalsy();
            expect(details.showIcon().getCssValue('background-image')).toEqual(initialUrl);
            expect(list.showIconAt(0).getCssValue('background-image')).toEqual(initialUrl);
        });
    });
});