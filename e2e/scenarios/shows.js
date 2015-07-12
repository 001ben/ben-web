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
});