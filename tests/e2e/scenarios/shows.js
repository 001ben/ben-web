'use strict';

var ShowList = require('../pages/show-list.js');
var ShowDetails = require('../pages/show-details.js');
var Help = require('../help/helpers.js');

describe('my app', function () {

    var shows = new ShowList();
    var details = new ShowDetails();
    var help = new Help();

    beforeEach(function () {
        shows.loadAll();
    });

    it('should load a list of shows', function () {
        expect(shows.count()).toBeGreaterThan(1);
    });

    describe('selecting a show', function () {

        it('should display a different show title in the details', function () {
            shows.selectShow(1);
            var name = details.currentShowName();
            shows.selectShow(2);
            expect(details.currentShowName()).not.toEqual(name);
        });
    });

    describe('toggling a show as complete', function () {

        it('should hide the "next" input', function () {
            shows.selectShow(0);
            var checkbox = element(by.model('ul.selected.watched'));
            var checkboxVal = checkbox.getAttribute('aria-checked');
            var nextBoxDisplayed = element(by.model('ul.selected.next')).isDisplayed();

            var initialValue, initialDisplayed;

            checkboxVal.then(function (v) {
                initialValue = v;
            });
            
            nextBoxDisplayed.then(function (v) {
                initialDisplayed = v;
            });

            checkbox.click();
            expect(checkboxVal).not.toEqual(initialValue);
            expect(nextBoxDisplayed).not.toEqual(initialDisplayed);
        });
    });
    
    describe('validation logic', function() {
        
        it('should require a name to be entered', function() {
            
        });
    });
});